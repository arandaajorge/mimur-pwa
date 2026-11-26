const SUPABASE_URL = "https://ozsqcrwjcwkuukbbnpur.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ilGVLCg6aEsmZCKn82sliQ_FvUr07Gt";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = id => document.getElementById(id);
const money = n => n == null ? 'Por confirmar' : new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const safe = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fecha = v => v ? new Date(v).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Mexico_City'}) : 'Por confirmar';
const one = v => Array.isArray(v) ? v[0] : v;
const node = (tag,text,cls) => {const n=document.createElement(tag); if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
const button = (text,fn) => {const b=node('button',text);b.type='button';b.onclick=fn;return b;};
const line = (parent,text) => parent.appendChild(node('p',text));
const getUser = async () => {const {data,error}=await supabaseClient.auth.getUser();return error?null:data.user;};
let vista="inicio", retornoPerfil="explorar";
let catalogo=[], favoritos=new Set(), sesionId=null, epoch=0, perfilAbierto=null, catalogError=false;
const estadosOferta={pending:'Pendiente de respuesta',accepted:'Cotización recibida',declined:'Rechazada',withdrawn:'Retirada'};
const estadosSolicitud={open:'Solicitud enviada',matching:'Buscando músicos',offers_received:'Cotizaciones disponibles',booked:'Contratación registrada',cancelled:'Solicitud cancelada',completed:'Evento finalizado'};
const estadosPago={pending:'Pendiente de pago',processing:'Procesando pago',paid:'Pago recibido',failed:'Pago rechazado',refunded:'Reembolsado',cancelled:'Cancelado'};
const estadosReserva={pending_confirmation:'Reserva registrada. Pago pendiente.',confirmed:'Reserva confirmada',cancelled:'Reserva cancelada',completed:'Evento finalizado'};
async function cargarMusicosAprobados(){
 const {data,error}=await supabaseClient.from('musicians_catalog').select('id,artist_name,genres,zone,service_radius_km,minimum_price_mxn,event_price_mxn,hourly_price_mxn,bio,experience,repertoire,members,equipment,services,photo_urls,video_url,emergency_opt_in,availability').eq('approved',true).order('artist_name');
 catalogError=!!error;if(error)console.error(error);
 catalogo=(data||[]).map(m=>({id:m.id,name:m.artist_name,genre:m.genres?.[0]||'Otro',genres:m.genres||[],zone:m.zone,serviceRadiusKm:m.service_radius_km,price:m.event_price_mxn??m.minimum_price_mxn??m.hourly_price_mxn??null,eventPrice:m.event_price_mxn,hourlyPrice:m.hourly_price_mxn,unit:m.event_price_mxn==null&&m.minimum_price_mxn==null&&m.hourly_price_mxn!=null?'hora':'evento',icon:'🎤',bio:m.bio||'Este músico aún no ha agregado su biografía.',experience:m.experience,repertoire:m.repertoire,members:m.members,equipment:m.equipment,services:m.services,photoUrls:m.photo_urls||[],videoUrl:m.video_url,emergencyOptIn:m.emergency_opt_in,status:m.availability==='available'?'Disponible':m.availability==='emergency_only'?'Emergencias':'Ocupado'}));
 render();
 if(perfilAbierto){const m=catalogo.find(x=>x.id===perfilAbierto);if(m)abrirPerfilPublicoMusico(m,false);else cerrarPerfil();}
 else if(location.hash.startsWith('#musico-')){const m=catalogo.find(x=>'#musico-'+encodeURIComponent(x.id)===location.hash);if(m)abrirPerfilPublicoMusico(m);}
}
function coincideGeneroMusical(musico, filtro) {
  const normalizar = v =>
    String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const generos = (musico.genres || []).map(normalizar);
  const seleccionado = normalizar(filtro);

  if (!seleccionado) return true;

  const categorias = {
    solista: [
      'solista',
      'acustico',
      'trova',
      'balada',
      'bolero',
      'romantica'
    ],
    'rock / pop': [
      'rock',
      'pop',
      'rock en español',
      'rock alternativo',
      'indie'
    ]
  };

  if (categorias[seleccionado]) {
    return generos.some(g =>
      categorias[seleccionado].includes(g)
    );
  }

  return generos.includes(seleccionado);
}
function render(){
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 const q=norm($('q')?.value),g=norm($('genre')?.value),z=norm($('zone')?.value);
 const filas = catalogo.filter(m => {
  if (vista === 'favoritos') {
    return favoritos.has(m.id);
  }

  const coincideTexto =
  !q ||
  norm([m.name, ...m.genres, m.zone].join(' ')).includes(q) ||
  (
    ['solista', 'solistas'].includes(q) &&
    coincideGeneroMusical(m, 'Solista')
  ) ||
  (
    ['rock pop', 'rock / pop', 'rock-pop'].includes(q) &&
    coincideGeneroMusical(m, 'Rock / Pop')
  );

  const coincideGenero =
    coincideGeneroMusical(m, $('genre')?.value);

  const coincideZona =
    !z ||
    norm(m.zone) === z ||
    norm(m.zone).split(',')[0] === z;

  return coincideTexto && coincideGenero && coincideZona;
});
 $('musicians').innerHTML=filas.map(m=>`<article class="musician"><div class="art">${m.photoUrls.find(x=>httpsUrl(x))?`<img src="${safe(m.photoUrls.find(x=>httpsUrl(x)))}" alt="${safe(m.name)}" loading="lazy" style="width:100%;height:180px;object-fit:cover">`:'🎤'}</div><div class="body"><div class="cardheading"><h3>${safe(m.name)}</h3><button type="button" class="favorite-btn" data-favorite-id="${safe(m.id)}" aria-pressed="${favoritos.has(m.id)}" aria-label="${favoritos.has(m.id)?'Quitar de favoritos':'Guardar en favoritos'}">${favoritos.has(m.id)?'♥':'♡'}</button></div><div class="muted">${safe(m.genres.join(' · ')||m.genre)} · ${safe(m.zone)}</div><div class="stars"><small>Sin reseñas verificadas</small></div><p class="muted">${safe(m.bio)}</p><div class="chips"><span class="chip">${safe(m.status)}</span><span class="chip">Perfil MiMuR</span></div><div class="cardbottom"><b>${m.price==null?'Precio por confirmar':`Desde ${money(m.price)} <small class="muted">/ ${safe(m.unit)}</small>`}</b><button type="button" data-profile-id="${safe(m.id)}">Ver perfil</button><button type="button" data-id="${safe(m.id)}">Solicitar</button></div></div></article>`).join('');
 $('empty').hidden=filas.length>0;$('empty').textContent=catalogError?'No se pudo cargar el catálogo. Actualiza la página.':vista==='favoritos'?'Todavía no tienes artistas guardados.':'No se encontraron músicos con estos filtros.';
 document.querySelectorAll('#musicians [data-profile-id]').forEach(b=>b.onclick=()=>abrirPerfilPublicoMusico(catalogo.find(m=>m.id===b.dataset.profileId)));
 document.querySelectorAll('#musicians [data-id]').forEach(b=>b.onclick=()=>openRequest(catalogo.find(m=>m.id===b.dataset.id)));
 document.querySelectorAll('#musicians [data-favorite-id]').forEach(b=>b.onclick=()=>alternarFavorito(b.dataset.favoriteId));
 actualizarBotonFavorito();
}
function actualizarBotonFavorito(){const b=$('perfilPublicoFavorito');if(b&&perfilAbierto)b.textContent=favoritos.has(perfilAbierto)?'♥ Quitar de favoritos':'♡ Guardar en favoritos';}
async function cargarFavoritos(){const e=epoch,u=await getUser();if(e!==epoch)return;if(!u){favoritos.clear();render();return;}const {data,error}=await supabaseClient.from('favorites').select('musician_id').eq('customer_id',u.id);if(e!==epoch||u.id!==sesionId)return;if(error){console.error(error);return;}favoritos=new Set(data.map(f=>f.musician_id));render();}
const favoritosOcupados=new Set();
async function alternarFavorito(id){if(favoritosOcupados.has(id))return;favoritosOcupados.add(id);const e=epoch;try{const u=await getUser();if(!u)throw new Error('Inicia sesión para guardar tus favoritos.');if(e!==epoch||u.id!==sesionId)return;const quitar=favoritos.has(id);const {error}=quitar?await supabaseClient.from('favorites').delete().eq('customer_id',u.id).eq('musician_id',id):await supabaseClient.from('favorites').insert({customer_id:u.id,musician_id:id});if(error)throw error;if(e===epoch){quitar?favoritos.delete(id):favoritos.add(id);render();}}catch(error){alert(error.message);}finally{favoritosOcupados.delete(id);}}
function cerrarPerfil(){perfilAbierto=null;if($('perfilPublicoMusico'))$('perfilPublicoMusico').hidden=true;history.replaceState(null,'',location.pathname+location.search);if(vista==='perfil'){vista=retornoPerfil;aplicarVista();render();}}
function httpsUrl(v){try{const u=new URL(v);return u.protocol==='https:'?u:null;}catch{return null;}}
function galeriaFotos(galeria,fotos,nombre){
 galeria.replaceChildren();fotos=fotos.filter(x=>httpsUrl(x));if(!fotos.length)return;
 galeria.append(node('h3','Galería del artista'));const c=node('div',null,'mimur-carrusel'),img=node('img',null,'mimur-carrusel-imagen'),contador=node('span',null,'mimur-carrusel-contador');let i=0;img.alt='Fotografía de '+nombre;
 const anterior=button('❮',()=>mover(-1)),siguiente=button('❯',()=>mover(1));anterior.className='mimur-carrusel-anterior';siguiente.className='mimur-carrusel-siguiente';anterior.setAttribute('aria-label','Fotografía anterior');siguiente.setAttribute('aria-label','Fotografía siguiente');
 function mostrar(){img.src=fotos[i];contador.textContent=`${i+1} / ${fotos.length}`;if(fotos.length>1){const pre=new Image();pre.src=fotos[(i+1)%fotos.length];}}
 function mover(d){i=(i+d+fotos.length)%fotos.length;mostrar();}anterior.hidden=siguiente.hidden=fotos.length<=1;
 function swipe(el,fn){let x=null;el.addEventListener('touchstart',e=>x=e.changedTouches[0].screenX,{passive:true});el.addEventListener('touchend',e=>{if(x==null)return;const d=e.changedTouches[0].screenX-x;x=null;if(Math.abs(d)>=50)fn(d<0?1:-1);},{passive:true});}
 swipe(c,mover);c.append(img,anterior,siguiente,contador);galeria.append(c);mostrar();img.style.cursor='zoom-in';
 img.onclick=()=>{const visor=node('div',null,'mimur-visor-fotos'),foto=node('img',null,'mimur-visor-imagen'),num=node('span',null,'mimur-visor-numero');let p=i;const old=document.body.style.overflow;const close=()=>{visor.remove();document.body.style.overflow=old;document.removeEventListener('keydown',key);};const moverV=d=>{p=(p+d+fotos.length)%fotos.length;foto.src=fotos[p];num.textContent=`${p+1} / ${fotos.length}`;};const key=e=>{if(e.key==='Escape')close();if(e.key==='ArrowRight')moverV(1);if(e.key==='ArrowLeft')moverV(-1);};const b=button('×',close),a=button('❮',()=>moverV(-1)),s=button('❯',()=>moverV(1));b.className='mimur-visor-cerrar';a.className='mimur-visor-atras';s.className='mimur-visor-adelante';a.hidden=s.hidden=fotos.length<=1;foto.alt='Fotografía ampliada';swipe(foto,moverV);visor.onclick=e=>{if(e.target===visor)close();};visor.append(foto,b,a,s,num);document.body.append(visor);document.body.style.overflow='hidden';document.addEventListener('keydown',key);moverV(0);};
}
function abrirPerfilPublicoMusico(m,scroll=true){if(!m||!$('perfilPublicoMusico'))return;if(vista!=='perfil')retornoPerfil=vista;vista='perfil';perfilAbierto=m.id;aplicarVista();const p=$('perfilPublicoMusico');$('perfilPublicoNombre').textContent=m.name;$('perfilPublicoGenero').textContent=m.genres.join(' · ')||m.genre;$('perfilPublicoBio').textContent=m.bio;$('perfilPublicoZona').textContent=m.zone;$('perfilPublicoPrecio').textContent=m.price==null?'Precio por confirmar':`Desde ${money(m.price)} / ${m.unit}`;$('perfilPublicoDisponibilidad').textContent=m.status;
 let d=$('perfilPublicoDetalles');if(!d){d=node('div');d.id='perfilPublicoDetalles';$('perfilPublicoBio').after(d);}d.replaceChildren();for(const [t,v] of [['Experiencia',m.experience],['Integrantes',m.members],['Equipo',m.equipment],['Servicios',m.services],['Repertorio',m.repertoire]]){if(v&&v.length){const s=node('div');s.append(node('h4',t),node('p',Array.isArray(v)?v.join(' · '):v));d.append(s);}}
 let g=$('perfilPublicoGaleria');if(!g){g=node('div');g.id='perfilPublicoGaleria';d.after(g);}galeriaFotos(g,m.photoUrls,m.name);
 const vc=$('perfilPublicoVideo');vc.replaceChildren();const u=httpsUrl(m.videoUrl);let id=null;if(u){if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))id=/^\/(shorts|live|embed)\//.test(u.pathname)?u.pathname.split('/')[2]:u.searchParams.get('v');else if(u.hostname==='youtu.be')id=u.pathname.split('/')[1];}
 if(id&&/^[\w-]{11}$/.test(id)){const f=node('iframe');f.src='https://www.youtube-nocookie.com/embed/'+id;f.title='Video de '+m.name;f.loading='lazy';f.allowFullscreen=true;f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';f.style.cssText='width:100%;border:0;border-radius:14px;display:block;margin:auto;aspect-ratio:'+(u.pathname.startsWith('/shorts/')?'9/16;max-width:320px':'16/9');vc.append(f);}else if(u&&/\.(mp4|webm|ogg)$/i.test(u.pathname)){const v=node('video');v.src=u.href;v.controls=true;v.playsInline=true;v.preload='metadata';v.style.width='100%';vc.append(v);}else vc.textContent='Video no disponible en un formato compatible.';
 actualizarBotonFavorito();$('perfilPublicoFavorito').onclick=()=>alternarFavorito(m.id);$('perfilPublicoCompartir').onclick=async()=>{const url=location.origin+location.pathname+'#musico-'+encodeURIComponent(m.id);try{if(navigator.share)await navigator.share({title:m.name,text:'Conoce este artista en MiMuR',url});else if(navigator.clipboard){await navigator.clipboard.writeText(url);alert('Enlace copiado.');}else prompt('Copia el enlace:',url);}catch(e){if(e.name!=='AbortError')alert('No se pudo compartir.');}};$('perfilPublicoSolicitar').onclick=()=>{cerrarPerfil();openRequest(m);};$('perfilPublicoResenas').textContent='Aún no hay reseñas verificadas para este músico.';p.hidden=false;history.replaceState(null,'','#musico-'+encodeURIComponent(m.id));if(scroll)p.scrollIntoView({behavior:'smooth',block:'start'});
}
$('volverCatalogoMusicos')?.addEventListener('click',()=>{cerrarPerfil();$('musicians').scrollIntoView({behavior:'smooth'});});
function actualizarPanelMusico(p,u){if($('panelMusico'))$('panelMusico').hidden=!(p&&u);if(p&&$('estadoPerfilMusico'))$('estadoPerfilMusico').textContent=`Bienvenido, ${p.artist_name}. Tu perfil ${p.approved?'está aprobado':'está pendiente de aprobación'}.`;}
async function cargarMiPerfilMusico(){const e=epoch,u=await getUser(),f=$('lead'),msg=$('leadMsg');if(e!==epoch)return;if(!u){actualizarPanelMusico(null,null);return;}const {data:p,error}=await supabaseClient.from('musicians').select('*').eq('user_id',u.id).maybeSingle();if(e!==epoch||u.id!==sesionId)return;if(error||!p){msg.textContent=error?'No se pudo cargar tu perfil.':'Todavía no tienes un perfil de músico.';actualizarPanelMusico(null,u);return;}const campos={name:p.artist_name,phone:p.phone,zone:p.zone,genre:p.genres?.[0],video:p.video_url,eventPrice:p.event_price_mxn??p.minimum_price_mxn,hourlyPrice:p.hourly_price_mxn,pricingNotes:p.pricing_notes,bio:p.bio,experience:p.experience,repertoire:p.repertoire,members:p.members,equipment:p.equipment,services:p.services,photo_urls:p.photo_urls};for(const [k,v] of Object.entries(campos))if(f.elements[k])f.elements[k].value=Array.isArray(v)?v.join('\n'):v??'';f.elements.emergency.checked=p.emergency_opt_in===true;
 const lista=$('listaMisFotos');if(lista){lista.replaceChildren();for(const url of p.photo_urls||[]){const c=node('div'),img=node('img');img.src=url;img.alt='Fotografía del músico';img.loading='lazy';img.style.cssText='width:130px;height:130px;object-fit:cover;border-radius:12px';c.style.cssText='display:inline-flex;flex-direction:column;gap:8px;margin:8px';const b=button('Eliminar foto',async()=>{if(!confirm('¿Eliminar esta fotografía?'))return;b.disabled=true;try{const actual=await getUser();if(actual?.id!==u.id||e!==epoch)throw new Error('La sesión cambió.');const {data:actualPerfil,error:err}=await supabaseClient.from('musicians').select('photo_urls').eq('user_id',u.id).single();if(err)throw err;const {error}=await supabaseClient.from('musicians').update({photo_urls:(actualPerfil.photo_urls||[]).filter(x=>x!==url)}).eq('user_id',u.id);if(error)throw error;const parsed=httpsUrl(url),prefix='/storage/v1/object/public/musician-photos/';if(parsed?.origin===new URL(SUPABASE_URL).origin&&parsed.pathname.startsWith(prefix)){const path=decodeURIComponent(parsed.pathname.slice(prefix.length));if(path.startsWith(u.id+'/')){const {error}=await supabaseClient.storage.from('musician-photos').remove([path]);if(error)console.warn('Archivo no eliminado',error);}}await cargarMiPerfilMusico();await cargarMusicosAprobados();}catch(error){alert(error.message);}finally{b.disabled=false;}});c.append(img,b);lista.append(c);}}
 msg.textContent=p.approved?'Tu perfil está aprobado. Puedes editar tus datos.':'Tu perfil está pendiente de aprobación.';actualizarPanelMusico(p,u);
}
$('lead').onsubmit=async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type="submit"]'),msg=$('leadMsg');if(b?.disabled||!f.reportValidity())return;if(b)b.disabled=true;let subidos=[],guardado=false;try{const u=await getUser();if(!u)throw new Error('Inicia sesión en Mi cuenta.');const d=Object.fromEntries(new FormData(f));const lista=v=>String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const tarifa=v=>{if(v==null||String(v).trim()==='')return null;const n=Number(v);if(!Number.isInteger(n)||n<10||n>1000000)throw new Error('Las tarifas deben estar entre $10 y $1,000,000 MXN, sin decimales.');return n;};const event=tarifa(d.eventPrice),hour=tarifa(d.hourlyPrice);const {data:p,error}=await supabaseClient.from('musicians').select('id,photo_urls').eq('user_id',u.id).maybeSingle();if(error)throw error;const archivos=Array.from(f.elements.photo_files?.files||[]);if(archivos.length>10)throw new Error('Máximo 10 fotografías por vez.');for(const a of archivos)if(!a.type.startsWith('image/')||a.size>10*1024*1024)throw new Error('Solo imágenes de hasta 10 MB.');const fotos=[...(p?.photo_urls||[])];for(const a of archivos){const path=u.id+'/'+crypto.randomUUID()+'-'+a.name.replace(/[^a-zA-Z0-9._-]/g,'_');const {error}=await supabaseClient.storage.from('musician-photos').upload(path,a,{contentType:a.type,upsert:false});if(error)throw error;subidos.push(path);fotos.push(supabaseClient.storage.from('musician-photos').getPublicUrl(path).data.publicUrl);}const perfil={artist_name:d.name.trim(),phone:d.phone.trim(),genres:[d.genre],zone:d.zone.trim(),video_url:d.video.trim(),bio:(d.bio||'').trim(),experience:(d.experience||'').trim(),repertoire:lista(d.repertoire),members:lista(d.members),equipment:(d.equipment||'').trim(),services:lista(d.services),event_price_mxn:event,hourly_price_mxn:hour,minimum_price_mxn:event,pricing_notes:(d.pricingNotes||'').trim(),emergency_opt_in:f.elements.emergency.checked,photo_urls:fotos};msg.textContent='Guardando perfil...';const r=await (p?supabaseClient.from('musicians').update(perfil).eq('user_id',u.id):supabaseClient.from('musicians').insert({...perfil,user_id:u.id})).select('id').single();if(r.error)throw r.error;guardado=true;if(f.elements.photo_files)f.elements.photo_files.value='';await cargarMiPerfilMusico();await cargarMusicosAprobados();msg.textContent=p?'¡Perfil actualizado correctamente!':'¡Perfil registrado! Pendiente de aprobación.';}catch(error){if(!guardado&&subidos.length)await supabaseClient.storage.from('musician-photos').remove(subidos);msg.textContent='Error al guardar: '+error.message;}finally{if(b)b.disabled=false;}};
$('editarPerfilMusico')?.addEventListener('click',()=>$('registro')?.scrollIntoView({behavior:'smooth'}));
function openRequest(m){if(!m)return;$('requestTitle').textContent='Solicitar músicos compatibles con '+m.genre;$('requestForm').elements.musicianId.value=m.id;$('requestMsg').textContent='La solicitud se distribuirá por género y zona; no es exclusiva de este artista.';const f=$('requestForm');if(!f.elements.date.value)f.elements.date.value=$('fechaBusqueda').value;if(!f.elements.budget.value)f.elements.budget.value=$('presupuestoBusqueda').value;if(!f.elements.eventZone.value)f.elements.eventZone.value=$('zone').value||m.zone;$('request').showModal();}
$('close').oncl
