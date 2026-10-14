

const SUPABASE_URL = "https://ozsqcrwjcwkuukbbnpur.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ilGVLCg6aEsmZCKn82sliQ_FvUr07Gt";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const demo=[{id:"d1",name:"Mariachi Sol de México",genre:"Mariachi",zone:"Coyoacán",price:3500,unit:"hora",icon:"🎺",bio:"Serenatas y eventos familiares.",status:"Disponible"},{id:"d2",name:"DJ Nébula",genre:"DJ",zone:"Benito Juárez",price:2800,unit:"evento",icon:"🎧",bio:"Pop, electrónica y música para bailar.",status:"Disponible"},{id:"d3",name:"Norteño Los del Valle",genre:"Norteño",zone:"Azcapotzalco",price:4200,unit:"hora",icon:"🪗",bio:"Clásicos norteños para fiestas.",status:"Emergencias"},{id:"d4",name:"Grupo Prisma",genre:"Grupo versátil",zone:"Centro",price:6500,unit:"evento",icon:"🎤",bio:"Cumbia, salsa, pop y clásicos.",status:"Disponible"},{id:"d5",name:"Ruta 80",genre:"Rock / Pop",zone:"Benito Juárez",price:5000,unit:"evento",icon:"🎸",bio:"Rock en español e internacional.",status:"Ocupado"},{id:"d6",name:"Mariachi Tradición",genre:"Mariachi",zone:"Centro",price:3000,unit:"hora",icon:"🎻",bio:"Música tradicional para celebraciones.",status:"Disponible"}];const $=id=>document.getElementById(id);const money=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const read=k=>{try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return[]}};const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));function render(){let q=$("q").value.toLowerCase(),g=$("genre").value,z=$("zone").value;let rows=demo.filter(m=>(!q||(m.name+" "+m.genre+" "+m.zone).toLowerCase().includes(q))&&(!g||m.genre===g)&&(!z||m.zone===z));$("musicians").innerHTML=rows.map(m=>`<article class="musician"><div class="art">${m.icon}</div><div class="body"><h3>${safe(m.name)}</h3><div class="muted">${safe(m.genre)} · ${safe(m.zone)}</div><p class="muted">${safe(m.bio)}</p><div class="chips"><span class="chip">${m.status==="Disponible"?"🟢":m.status==="Emergencias"?"🟡":"🔴"} ${m.status}</span><span class="chip">Perfil demo</span></div><div class="cardbottom"><b>Desde ${money(m.price)}<small class="muted"> / ${m.unit}</small></b><button data-id="${m.id}">Solicitar</button></div></div></article>`).join("");$("empty").hidden=rows.length>0;document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>openRequest(demo.find(m=>m.id===b.dataset.id)))}["q","genre","zone"].forEach(id=>$(id).addEventListener(id==="q"?"input":"change",render));function openRequest(m){$("requestTitle").textContent="Solicitar a "+m.name;$("requestForm").elements.musicianId.value=m.id;$("requestMsg").textContent="";$("request").showModal()}$("close").onclick=()=>$("request").close();$("requestForm").onsubmit=e=>{e.preventDefault();let f=e.currentTarget;if(!f.reportValidity())return;let d=Object.fromEntries(new FormData(f));d.createdAt=new Date().toISOString();d.status="Solicitud local de demostración";try{let a=read("mimur_demo_requests");a.push(d);save("mimur_demo_requests",a);$("requestMsg").textContent="Guardada en este navegador; no se notificó al músico.";f.reset();setTimeout(()=>$("request").close(),1600)}catch{$("requestMsg").textContent="No se pudo guardar en este navegador."}};$("lead").onsubmit=e=>{e.preventDefault();let f=e.currentTarget;if(!f.reportValidity())return;let d=Object.fromEntries(new FormData(f));d.emergency=f.elements.emergency.checked;d.createdAt=new Date().toISOString();try{let a=read("mimur_demo_leads");a.push(d);save("mimur_demo_leads",a);$("leadMsg").textContent="Registro guardado en este dispositivo. No se envió a un servidor.";f.reset()}catch{$("leadMsg").textContent="No se pudo guardar localmente."}};let installEvent;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvent=e;$("install").hidden=false});$("install").onclick=async()=>{if(!installEvent){alert("Usa el menú del navegador y busca Instalar aplicación o Añadir a pantalla de inicio. Requiere HTTPS o localhost.");return}installEvent.prompt();await installEvent.userChoice;installEvent=null;$("install").hidden=true};if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));render();






const connectionStatus = document.createElement("pre");
connectionStatus.style.cssText =
  "padding:12px;margin:12px;border:1px solid #888;white-space:pre-wrap;";
connectionStatus.textContent = "Probando cliente de Supabase...";
document.body.prepend(connectionStatus);

supabaseClient
  .from("musicians")
  .select("id")
  .eq("approved", true)
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      connectionStatus.textContent =
        "Error del cliente: " + error.message;
    } else {
      connectionStatus.textContent =
        "CLIENTE CONECTADO CORRECTAMENTE\n" +
        "Músicos aprobados encontrados: " + data.length;
    }
  })
  .catch((error) => {
    connectionStatus.textContent =
      "Error inesperado: " + error.message;
  });

(async function configurarAutenticacionMiMuR() {
  const form = document.getElementById("authForm");
  const mensaje = document.getElementById("authMsg");
  const botonRegistro = document.getElementById("signUp");
  const botonLogin = document.getElementById("signIn");

  if (!form || !mensaje || !botonRegistro || !botonLogin) {
    console.error("No se encontró el formulario de cuenta de MiMuR.");
    return;
  }

  botonRegistro.addEventListener("click", async () => {
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (!form.elements.email.reportValidity()) return;
    if (!form.elements.password.reportValidity()) return;

    mensaje.textContent = "Creando cuenta...";

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email.split("@")[0]
        }
      }
    });

    if (error) {
      mensaje.textContent = "No se pudo crear la cuenta: " + error.message;
      return;
    }

    if (data.session) {
      mensaje.textContent = "Cuenta creada e inicio de sesión correcto.";
    } else {
      mensaje.textContent =
        "Registro recibido. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.";
    }
  });

  botonLogin.addEventListener("click", async () => {
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (!form.elements.email.reportValidity()) return;
    if (!form.elements.password.reportValidity()) return;

    mensaje.textContent = "Iniciando sesión...";

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      mensaje.textContent = "No se pudo iniciar sesión: " + error.message;
      return;
    }

    mensaje.textContent =
      "Sesión iniciada correctamente: " + data.user.email;
  });
})();



