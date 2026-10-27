

const SUPABASE_URL = "https://ozsqcrwjcwkuukbbnpur.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ilGVLCg6aEsmZCKn82sliQ_FvUr07Gt";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const demo=[{id:"d1",name:"Mariachi Sol de México",genre:"Mariachi",zone:"Coyoacán",price:3500,unit:"hora",icon:"🎺",bio:"Serenatas y eventos familiares.",status:"Disponible"},{id:"d2",name:"DJ Nébula",genre:"DJ",zone:"Benito Juárez",price:2800,unit:"evento",icon:"🎧",bio:"Pop, electrónica y música para bailar.",status:"Disponible"},{id:"d3",name:"Norteño Los del Valle",genre:"Norteño",zone:"Azcapotzalco",price:4200,unit:"hora",icon:"🪗",bio:"Clásicos norteños para fiestas.",status:"Emergencias"},{id:"d4",name:"Grupo Prisma",genre:"Grupo versátil",zone:"Centro",price:6500,unit:"evento",icon:"🎤",bio:"Cumbia, salsa, pop y clásicos.",status:"Disponible"},{id:"d5",name:"Ruta 80",genre:"Rock / Pop",zone:"Benito Juárez",price:5000,unit:"evento",icon:"🎸",bio:"Rock en español e internacional.",status:"Ocupado"},{id:"d6",name:"Mariachi Tradición",genre:"Mariachi",zone:"Centro",price:3000,unit:"hora",icon:"🎻",bio:"Música tradicional para celebraciones.",status:"Disponible"}];const $=id=>document.getElementById(id);const money=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const read=k=>{try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return[]}};const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let catalogo = [...demo];

async function cargarMusicosAprobados() {
  const { data, error } = await supabaseClient
    .from("musicians")
    .select("*")
    .eq("approved", true);

  if (error) {
    console.error("Error al cargar músicos:", error.message);
    return;
  }

  
const reales = data.map(m => ({
  id: m.id,
  name: m.artist_name,
  genre: m.genres?.[0] || "Otro",
  genres: m.genres || [],
  zone: m.zone || "",
  serviceRadiusKm: m.service_radius_km ?? null,
  price: m.minimum_price_mxn,
  unit: "evento",
  icon: "🎤",
  bio: m.bio || "Este músico aún no ha agregado su biografía.",
  videoUrl: m.video_url || "",
  socialUrl: m.social_url || "",
  emergencyOptIn: m.emergency_opt_in === true,
  status: m.availability === "available"
    ? "Disponible"
    : m.availability === "emergency_only"
      ? "Emergencias"
      : "Ocupado"
}));


  catalogo = [...reales, ...demo];
  render();
}



async function cargarMiPerfilMusico() {
  const mensaje = $("leadMsg");
  const formulario = $("lead");

  const { data: { user }, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !user) {
    mensaje.textContent =
      "Inicia sesión para consultar o editar tu perfil de músico.";
    actualizarPanelMusico(null, null);
    return;
  }

  const { data: perfil, error } = await supabaseClient
    .from("musicians")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error al cargar perfil:", error);
    mensaje.textContent =
      "No se pudo cargar tu perfil. Inténtalo de nuevo.";
    actualizarPanelMusico(null, user);
    return;
  }

  if (!perfil) {
    mensaje.textContent =
      "Todavía no tienes un perfil de músico. Puedes registrarte aquí.";
    actualizarPanelMusico(null, user);
    return;
  }

  formulario.elements.name.value = perfil.artist_name || "";

  if (formulario.elements.price) {
    formulario.elements.price.value =
      perfil.minimum_price_mxn ?? "";
  }

  if (formulario.elements.phone) {
    formulario.elements.phone.value = perfil.phone || "";
  }

  formulario.elements.zone.value = perfil.zone || "";
  formulario.elements.genre.value = perfil.genres?.[0] || "";
  formulario.elements.video.value = perfil.video_url || "";
  formulario.elements.emergency.checked =
    perfil.emergency_opt_in === true;

  mensaje.textContent = perfil.approved
    ? "Tu perfil está aprobado. Puedes editar tus datos."
    : "Tu perfil está pendiente de aprobación. Puedes editar tus datos.";

  actualizarPanelMusico(perfil, user);
}

function actualizarPanelMusico(perfil, usuario) {
  const panel = $("panelMusico");
  const estado = $("estadoPerfilMusico");

  if (!panel) return;

  panel.hidden = !(usuario && perfil);

  if (!usuario || !perfil) return;

  if (estado) {
    estado.textContent = perfil.approved
      ? `Bienvenido, ${perfil.artist_name}. Tu perfil está aprobado.`
      : `Bienvenido, ${perfil.artist_name}. Tu perfil está pendiente de aprobación.`;
  }
}
const botonEditarPerfilMusico = $("editarPerfilMusico");

if (botonEditarPerfilMusico) {
  botonEditarPerfilMusico.onclick = () => {
    const registro = $("registro");

    if (registro) {
      registro.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };
}


async function cargarSolicitudesMusico() {
  const contenido = $("contenidoSolicitudesMusico");

  if (!contenido) return;

  contenido.hidden = false;
  contenido.innerHTML = "<p>Cargando tus ofertas...</p>";

  const {
    data: { user },
    error: authError
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    contenido.innerHTML =
      "<p>Inicia sesión para consultar tus ofertas.</p>";
    return;
  }

  const { data: musico, error: errorMusico } =
    await supabaseClient
      .from("musicians")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (errorMusico || !musico) {
    console.error("Error al consultar músico:", errorMusico);
    contenido.innerHTML =
      "<p>No se encontró tu perfil de músico.</p>";
    return;
  }

  const { data: ofertas, error } = await supabaseClient
    .from("offers")
    .select(`
      id,
      musician_price_mxn,
      customer_total_mxn,
      status,
      musician_note,
      created_at,
      event_requests (
        event_type,
        event_date,
        zone,
        genre,
        duration_minutes,
        budget_mxn,
        details,
        customer_name
      )
    `)
    .eq("musician_id", musico.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar ofertas:", error);
    contenido.innerHTML =
      "<p>No se pudieron cargar las ofertas. Verifica los permisos de lectura de Supabase.</p>";
    return;
  }

  if (!ofertas || ofertas.length === 0) {
    contenido.innerHTML = `
      <h3>Mis solicitudes</h3>
      <p>Aún no tienes ofertas de contratación.</p>
    `;
    return;
  }

  const escapar = (valor) =>
    String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caracter]);

  const pesos = (cantidad) =>
    cantidad == null
      ? "No especificado"
      : "$" + Number(cantidad).toLocaleString("es-MX") + " MXN";

  const fecha = (valor) => {
    if (!valor) return "Fecha por confirmar";

    const fechaEvento = new Date(valor);

    if (Number.isNaN(fechaEvento.getTime())) {
      return "Fecha por confirmar";
    }

    return fechaEvento.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  contenido.innerHTML = `
    <h3>Mis solicitudes (${ofertas.length})</h3>
    <div id="listaOfertasMusico"></div>
  `;

  const lista = $("listaOfertasMusico");

  ofertas.forEach((oferta) => {
    const evento = Array.isArray(oferta.event_requests)
      ? oferta.event_requests[0]
      : oferta.event_requests;

    const tarjeta = document.createElement("article");
    tarjeta.className = "oferta-musico-card";

    const estado = {
      pending: "Pendiente de respuesta",
      accepted: "Aceptada",
      declined: "Rechazada",
      withdrawn: "Retirada"
    }[oferta.status] || oferta.status;

    tarjeta.innerHTML = `
      <h4>${escapar(evento?.event_type || "Evento musical")}</h4>
      <p><strong>Fecha:</strong> ${escapar(fecha(evento?.event_date))}</p>
      <p><strong>Zona:</strong> ${escapar(evento?.zone || "No especificada")}</p>
      <p><strong>Género:</strong> ${escapar(evento?.genre || "No especificado")}</p>
      <p><strong>Duración:</strong> ${escapar(evento?.duration_minutes ?? "No especificada")} minutos</p>
      <p><strong>Presupuesto del cliente:</strong> ${escapar(pesos(evento?.budget_mxn))}</p>
      <p><strong>Tu precio:</strong> ${escapar(pesos(oferta.musician_price_mxn))}</p>
      <p><strong>Precio al cliente:</strong> ${escapar(pesos(oferta.customer_total_mxn))}</p>
      <p><strong>Estado:</strong> ${escapar(estado)}</p>
      ${evento?.customer_name ? `<p><strong>Cliente:</strong> ${escapar(evento.customer_name)}</p>` : ""}
      ${evento?.details ? `<p><strong>Detalles:</strong> ${escapar(evento.details)}</p>` : ""}
      ${oferta.musician_note ? `<p><strong>Nota:</strong> ${escapar(oferta.musician_note)}</p>` : ""}
      <div class="acciones-oferta"></div>
    `;

    const acciones = tarjeta.querySelector(".acciones-oferta");

    if (oferta.status === "pending") {
      const aceptar = document.createElement("button");
      aceptar.type = "button";
      aceptar.textContent = "Aceptar oferta";

      const rechazar = document.createElement("button");
      rechazar.type = "button";
      rechazar.textContent = "Rechazar oferta";

      aceptar.onclick = () =>
        responderOfertaMusico(oferta.id, "accepted", aceptar, rechazar);

      rechazar.onclick = () =>
        responderOfertaMusico(oferta.id, "declined", aceptar, rechazar);

      acciones.append(aceptar, rechazar);
    }

    lista.appendChild(tarjeta);
  });
}

async function responderOfertaMusico(
  ofertaId,
  decision,
  botonAceptar,
  botonRechazar
) {
  const confirmacion = decision === "accepted"
    ? "¿Confirmas que deseas aceptar esta oferta?"
    : "¿Confirmas que deseas rechazar esta oferta?";

  if (!confirm(confirmacion)) return;

  botonAceptar.disabled = true;
  botonRechazar.disabled = true;

  const { error } = await supabaseClient.rpc(
    "responder_oferta_musico",
    {
      p_offer_id: ofertaId,
      p_decision: decision
    }
  );

  if (error) {
    console.error("Error al responder oferta:", error);
    alert("No se pudo responder la oferta: " + error.message);
    botonAceptar.disabled = false;
    botonRechazar.disabled = false;
    return;
  }

  alert(
    decision === "accepted"
      ? "Oferta aceptada correctamente."
      : "Oferta rechazada correctamente."
  );

  await cargarSolicitudesMusico();
}

const botonVerSolicitudesMusico = $("verSolicitudesMusico");

if (botonVerSolicitudesMusico) {
  botonVerSolicitudesMusico.onclick = async () => {
    const contenido = $("contenidoSolicitudesMusico");

    if (!contenido) return;

    if (contenido.hidden) {
      await cargarSolicitudesMusico();
    } else {
      contenido.hidden = true;
    }
  };
}

let favoritos = new Set();
let cargandoFavoritos = false;

async function cargarFavoritos() {
  const { data: { user }, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !user) {
    favoritos.clear();
    render();
    return;
  }

  cargandoFavoritos = true;

  const { data, error } = await supabaseClient
    .from("favorites")
    .select("musician_id")
    .eq("customer_id", user.id);

  cargandoFavoritos = false;

  if (error) {
    console.error("Error al cargar favoritos:", error.message);
    return;
  }

  favoritos = new Set(data.map(f => String(f.musician_id)));
  render();
}

async function responderOferta(offerId, decision) {
  if (!["accepted", "declined"].includes(decision)) {
    alert("Decisión no válida.");
    return;
  }

  const { data: { user }, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !user) {
    alert("Inicia sesión para responder ofertas.");
    return;
  }

  const { error } = await supabaseClient.rpc(
    "responder_oferta_musico",
    {
      p_offer_id: offerId,
      p_decision: decision
    }
  );

  if (error) {
    console.error("Error al responder oferta:", error);
    alert("No se pudo responder la oferta: " + error.message);
    return;
  }

  alert(
    decision === "accepted"
      ? "Oferta aceptada correctamente."
      : "Oferta rechazada correctamente."
  );
}
async function alternarFavorito(musicianId) {
  const { data: { user }, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !user) {
    alert("Inicia sesión para guardar tus favoritos.");
    return;
  }

  const id = String(musicianId);
  const esFavorito = favoritos.has(id);

  if (esFavorito) {
    const { error } = await supabaseClient
      .from("favorites")
      .delete()
      .eq("customer_id", user.id)
      .eq("musician_id", id);

    if (error) {
      alert("No se pudo quitar el favorito: " + error.message);
      return;
    }

    favoritos.delete(id);
  } else {
    const { error } = await supabaseClient
      .from("favorites")
      .insert({
        customer_id: user.id,
        musician_id: id
      });

    if (error) {
      alert("No se pudo guardar el favorito: " + error.message);
      return;
    }

    favoritos.add(id);
  }

  render();
}


function abrirPerfilPublicoMusico(musico) {
  if (!musico) return;

  const catalogoSection = document.getElementById("musicians");
  const perfil = document.getElementById("perfilPublicoMusico");

  if (!perfil) return;

  document.getElementById("perfilPublicoNombre").textContent =
    musico.name || "Artista MiMuR";

  document.getElementById("perfilPublicoGenero").textContent =
    (musico.genres || [musico.genre || "Otro"]).join(" · ");

  document.getElementById("perfilPublicoBio").textContent =
    musico.bio || "Este artista todavía no ha agregado una biografía.";

  document.getElementById("perfilPublicoZona").textContent =
    musico.zone || "Zona por confirmar";

  const precio = document.getElementById("perfilPublicoPrecio");
  precio.textContent =
    musico.price != null
      ? `Desde ${money(musico.price)} / ${musico.unit || "evento"}`
      : "Precio por confirmar";

  document.getElementById("perfilPublicoDisponibilidad").textContent =
    musico.status || "Disponibilidad por confirmar";

  const videoContenedor = document.getElementById("perfilPublicoVideo");
  videoContenedor.replaceChildren();

  const videoUrl = musico.videoUrl || musico.video_url || "";

  if (videoUrl) {
    let url;

    try {
      url = new URL(videoUrl);
    } catch {
      url = null;
    }

    if (url && ["https:", "http:"].includes(url.protocol)) {
      if (
        url.hostname === "www.youtube.com" ||
        url.hostname === "youtube.com" ||
        url.hostname === "m.youtube.com"
      ) {
        const videoId = url.searchParams.get("v");

        if (videoId && /^[\w-]{11}$/.test(videoId)) {
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
          iframe.title = `Video de ${musico.name || "artista MiMuR"}`;
          iframe.loading = "lazy";
          iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          iframe.allowFullscreen = true;
          iframe.style.width = "100%";
          iframe.style.aspectRatio = "16 / 9";
          iframe.style.border = "0";
          videoContenedor.appendChild(iframe);
        }
      } else if (
        url.hostname === "youtu.be"
      ) {
        const videoId = url.pathname.split("/").filter(Boolean)[0];

        if (videoId && /^[\w-]{11}$/.test(videoId)) {
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
          iframe.title = `Video de ${musico.name || "artista MiMuR"}`;
          iframe.loading = "lazy";
          iframe.allowFullscreen = true;
          iframe.style.width = "100%";
          iframe.style.aspectRatio = "16 / 9";
          iframe.style.border = "0";
          videoContenedor.appendChild(iframe);
        }
      } else if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
        const video = document.createElement("video");
        video.src = url.href;
        video.controls = true;
        video.preload = "metadata";
        video.playsInline = true;
        video.style.width = "100%";
        videoContenedor.appendChild(video);
      }

      if (!videoContenedor.children.length) {
        const enlace = document.createElement("a");
        enlace.href = url.href;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.textContent = "Ver presentación del artista";
        videoContenedor.appendChild(enlace);
      }
    } else {
      videoContenedor.textContent =
        "El enlace del video no es válido.";
    }
  } else {
    videoContenedor.textContent =
      "Este músico todavía no ha agregado un video.";
  }

  const redes = musico.socialUrl || musico.social_url || "";
  if (redes) {
    try {
      const socialUrl = new URL(redes);

      if (["https:", "http:"].includes(socialUrl.protocol)) {
        const enlaceRedes = document.createElement("a");
        enlaceRedes.href = socialUrl.href;
        enlaceRedes.target = "_blank";
        enlaceRedes.rel = "noopener noreferrer";
        enlaceRedes.textContent = "Ver redes sociales del artista";
        videoContenedor.appendChild(enlaceRedes);
      }
    } catch {
      // No mostrar enlaces de redes con formato inválido.
    }
  }

  const favoritosSet = typeof favoritos !== "undefined"
    ? favoritos
    : new Set();

  const botonFavorito = document.getElementById("perfilPublicoFavorito");
  const idMusico = String(musico.id);

  botonFavorito.textContent = favoritosSet.has(idMusico)
    ? "♥ Quitar de favoritos"
    : "♡ Guardar en favoritos";

  botonFavorito.onclick = () => {
    if (typeof alternarFavorito === "function") {
      alternarFavorito(idMusico);
      botonFavorito.textContent = favoritos.has(idMusico)
        ? "♥ Quitar de favoritos"
        : "♡ Guardar en favoritos";
    }
  };

  document.getElementById("perfilPublicoCompartir").onclick = async () => {
    const enlace = `${location.origin}${location.pathname}#musico-${encodeURIComponent(idMusico)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: musico.name || "Artista MiMuR",
          text: "Conoce este artista en MiMuR",
          url: enlace
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          alert("No se pudo compartir el perfil.");
        }
      }
    } else if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(enlace);
        alert("Enlace copiado. Compártelo con tus clientes.");
      } catch {
        alert("No se pudo copiar el enlace.");
      }
    } else {
      prompt("Copia el enlace del perfil:", enlace);
    }
  };

  document.getElementById("perfilPublicoSolicitar").onclick = () => {
    perfil.hidden = true;

    if (typeof openRequest === "function") {
      openRequest(musico);
    } else {
      alert("No se encontró el formulario de contratación.");
    }
  };

  const resenas = document.getElementById("perfilPublicoResenas");
  resenas.textContent =
    "Aún no hay reseñas verificadas para este músico.";

  if (catalogoSection) {
    catalogoSection.scrollIntoView({
      behavior: "auto",
      block: "start"
    });
  }

  perfil.hidden = false;
  perfil.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  history.replaceState(null, "", `#musico-${encodeURIComponent(idMusico)}`);
}

document.getElementById("volverCatalogoMusicos")?.addEventListener("click", () => {
  const perfil = document.getElementById("perfilPublicoMusico");
  if (perfil) perfil.hidden = true;

  history.replaceState(null, "", location.pathname + location.search);

  document.getElementById("musicians")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});


function render() {
  const campoBusqueda = $("q");
  const filtroGenero = $("genre");
  const filtroZona = $("zone");

  const q = (campoBusqueda?.value || "")
    .trim()
    .toLocaleLowerCase("es-MX");

  const g = filtroGenero?.value || "";
  const z = filtroZona?.value || "";

  const normalizar = (valor) =>
    String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase("es-MX");

  const filas = catalogo.filter((m) => {
    const nombre = normalizar(m.name);
    const genero = normalizar(m.genre);
    const zona = normalizar(m.zone);

    const coincideBusqueda =
      !q ||
      normalizar(`${m.name} ${m.genre} ${m.zone}`).includes(
        normalizar(q)
      );

    const coincideGenero =
      !g || genero === normalizar(g);

    const coincideZona =
      !z || zona === normalizar(z);

    return coincideBusqueda && coincideGenero && coincideZona;
  });

  $("musicians").innerHTML = filas.map((m) => {
    const id = String(m.id);
    const esFavorito = favoritos.has(id);

    return `
      <article class="musician">
        <div class="art">${safe(m.icon)}</div>

        <div class="body">
          <div class="cardheading">
            <h3>${safe(m.name)}</h3>

            <button
              type="button"
              class="favorite-btn"
              data-favorite-id="${safe(id)}"
              aria-label="${esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}"
              aria-pressed="${esFavorito}"
              title="${esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}"
            >${esFavorito ? "♥" : "♡"}</button>
          </div>

          <div class="muted">
            ${safe(m.genre)} · ${safe(m.zone)}
          </div>

          <div class="stars" aria-label="Sin calificaciones todavía">
            <span>★★★★★</span>
            <small>Nuevo en MiMuR</small>
          </div>

          <p class="muted">${safe(m.bio || "")}</p>

          <div class="chips">
            <span class="chip">
              ${m.status === "Disponible" ? "🟢" : m.status === "Emergencias" ? "🟡" : "🔴"}
              ${safe(m.status)}
            </span>
            <span class="chip">Perfil MiMuR</span>
          </div>

          <div class="cardbottom">
            <b>
              Desde ${money(m.price)}
              <small class="muted"> / ${safe(m.unit)}</small>
            </b>
            <button type="button" data-profile-id="${safe(id)}">Ver perfil</button>
<button type="button" data-id="${safe(id)}">Solicitar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $("empty").hidden = filas.length > 0;

  document.querySelectorAll("#musicians [data-id]").forEach((b) => {
    b.onclick = () => {
      const musico = catalogo.find(
        (m) => String(m.id) === b.dataset.id
      );

      if (musico) openRequest(musico);
    };
  });

  document.querySelectorAll("#musicians [data-favorite-id]").forEach((b) => {
    b.onclick = () => alternarFavorito(b.dataset.favoriteId);
  });
}


$("q").addEventListener("input", render);
$("genre").addEventListener("change", render);
$("zone").addEventListener("change", render);
function openRequest(m){$("requestTitle").textContent="Solicitar a "+m.name;$("requestForm").elements.musicianId.value=m.id;$("requestMsg").textContent="";$("request").showModal()}$("close").onclick=()=>$("request").close();
$("requestForm").onsubmit = async (e) => {
  e.preventDefault();

  const f = e.currentTarget;
  if (!f.reportValidity()) return;

  const mensaje = $("requestMsg");
  const boton = f.querySelector('[type="submit"]');

  try {
    const { data: { user }, error: userError } =
      await supabaseClient.auth.getUser();

    if (userError || !user) {
      mensaje.textContent =
        "Inicia sesión para enviar una solicitud de evento.";
      return;
    }

    const d = Object.fromEntries(new FormData(f));
    const fecha = new Date(d.date + "T12:00:00");

    const perfil = catalogo.find(m => m.id === d.musicianId);

    if (!perfil) {
      mensaje.textContent = "No se encontró el músico seleccionado.";
      return;
    }

    const solicitud = {
      customer_id: user.id,
      customer_name: d.customer.trim(),
      customer_phone: d.phone.trim(),
      event_type: "Contratación musical",
      event_date: fecha.toISOString(),
      zone: d.eventZone.trim(),
      genre: perfil.genre,
      budget_mxn: Number(d.budget),
      details: d.details.trim() || null,
      status: "open"
    };

    if (boton) boton.disabled = true;
    mensaje.textContent = "Enviando solicitud a MiMuR...";

    const { error } = await supabaseClient
      .from("event_requests")
      .insert(solicitud);

    

if (error) {
  console.error("Error al guardar solicitud:", error);
  mensaje.textContent =
    "No se pudo guardar la solicitud: " + error.message;
  return;
}



    mensaje.textContent =
      "¡Solicitud guardada en MiMuR correctamente!";
    f.reset();

    setTimeout(() => $("request").close(), 1800);

  } catch (error) {
    mensaje.textContent = "Error: " + error.message;
  } finally {
    if (boton) boton.disabled = false;
  }
};

$("lead").onsubmit = async (e) => {
  e.preventDefault();

  const f = e.currentTarget;
  if (!f.reportValidity()) return;

  const mensaje = $("leadMsg");
  const boton = f.querySelector('[type="submit"]');

  try {
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      mensaje.textContent =
        "Inicia sesión en Mi cuenta antes de registrar tu perfil de músico.";
      return;
    }

    const d = Object.fromEntries(new FormData(f));


const perfil = {
  artist_name: d.name.trim(),
  phone: d.phone.trim(),
  genres: [d.genre],
  zone: d.zone.trim(),
  video_url: d.video.trim(),
  minimum_price_mxn:
    d.price !== undefined && d.price.trim() !== ""
      ? Number(d.price)
      : null,
  emergency_opt_in: f.elements.emergency.checked
};


    if (boton) boton.disabled = true;
    mensaje.textContent = "Guardando perfil en MiMuR...";

    // Comprobar si este usuario ya tiene un perfil.
    const { data: existente, error: consultaError } =
      await supabaseClient
        .from("musicians")
        .select("id, approved")
        .eq("user_id", user.id)
        .maybeSingle();

    if (consultaError) {
      throw consultaError;
    }

    let errorGuardado;

    if (existente) {
      // Actualizar el perfil sin alterar su aprobación.

const resultado = await supabaseClient
  .from("musicians")
  .update(perfil)
  .eq("user_id", user.id)
  .select("id, artist_name, phone, approved");

console.log("MiMuR: resultado de actualización:", resultado);

if (resultado.error) {
  errorGuardado = resultado.error;
} else if (!resultado.data || resultado.data.length === 0) {
  errorGuardado = new Error(
    "Supabase no actualizó ninguna fila. Comprueba el usuario y los permisos."
  );
}

    } else {
      // Crear un perfil nuevo, pendiente de aprobación.
      const resultado = await supabaseClient
        .from("musicians")
        .insert({
          ...perfil,
          user_id: user.id,
          approved: false
        });

      errorGuardado = resultado.error;
    }

    if (errorGuardado) {
      console.error("Error al guardar perfil:", errorGuardado);
      mensaje.textContent =
        "No se pudo guardar el perfil: " + errorGuardado.message;
      return;
    }


    await cargarMiPerfilMusico();
    await cargarMusicosAprobados();

    mensaje.textContent = existente
      ? "¡Perfil actualizado correctamente en MiMuR!"
      : "¡Perfil registrado! Está pendiente de aprobación.";


  } catch (error) {
    console.error("Error en el registro de músico:", error);
    mensaje.textContent = "Error al guardar: " + error.message;
  } finally {
    if (boton) boton.disabled = false;
  }
};


  
let installEvent;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvent=e;$("install").hidden=false});$("install").onclick=async()=>{if(!installEvent){alert("Usa el menú del navegador y busca Instalar aplicación o Añadir a pantalla de inicio. Requiere HTTPS o localhost.");return}installEvent.prompt();await installEvent.userChoice;installEvent=null;$("install").hidden=true};if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));render();
cargarMusicosAprobados();


(function configurarAutenticacionMiMuR() {
  const form = document.getElementById("authForm");
  const mensaje = document.getElementById("authMsg");
  const registro = document.getElementById("signUp");
  const login = document.getElementById("signIn");

    if (!form || !mensaje || !registro || !login) {
    console.log("Formulario de cuenta no instalado todavía.");
    return;
  }

  registro.addEventListener("click", async function () {
    mensaje.textContent = "Botón activado: preparando registro...";

    try {
      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;

      if (!form.elements.email.reportValidity()) return;
      if (!form.elements.password.reportValidity()) return;

      if (password.length < 8) {
        mensaje.textContent = "La contraseña debe tener al menos 8 caracteres.";
        return;
      }

      mensaje.textContent = "Creando cuenta...";

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: email.split("@")[0] }
        }
      });

      if (error) {
        mensaje.textContent = "Error de registro: " + error.message;
        return;
      }

      mensaje.textContent = data.session
        ? "Cuenta creada correctamente."
        : "Registro recibido. Revisa tu correo para confirmar la cuenta.";
    } catch (error) {
      mensaje.textContent = "Error: " + error.message;
    }
  });

  login.addEventListener("click", async function () {
    mensaje.textContent = "Botón activado: preparando inicio de sesión...";

    try {
      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;

      if (!form.elements.email.reportValidity()) return;
      if (!form.elements.password.reportValidity()) return;

      mensaje.textContent = "Iniciando sesión...";

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        mensaje.textContent = "Error de inicio de sesión: " + error.message;
        return;
      }

      
mensaje.textContent = "¡Bienvenido a MiMuR!";

await cargarMiPerfilMusico();

// Cerrar la ventana de cuenta después de iniciar sesión
const ventanaCuenta = document.getElementById("accountDialog");

if (ventanaCuenta && ventanaCuenta.open) {
  ventanaCuenta.close();
}

// Actualizar el botón de cuenta
const botonCuenta = document.getElementById("openAccount");

if (botonCuenta) {
  botonCuenta.textContent = "Mi cuenta ✓";
}

// Mostrar bienvenida
alert("¡Bienvenido a MiMuR, " + (data.user.email || "usuario") + "!");

    } catch (error) {
      mensaje.textContent = "Error: " + error.message;
    }
  });
})();
console.log("MiMuR cargado correctamente");

cargarFavoritos();


supabaseClient.auth.onAuthStateChange((event, session) => {
  setTimeout(async () => {
    if (session?.user) {
      await cargarMiPerfilMusico();
      await cargarFavoritos();
    } else {
      const formulario = document.getElementById("lead");

      if (formulario) {
        formulario.reset();
      }

      const mensaje = document.getElementById("leadMsg");

      if (mensaje) {
        mensaje.textContent =
          "Inicia sesión para consultar o editar tu perfil de músico.";
      }

      await cargarFavoritos();
    }
  }, 0);
});


/* Ventana emergente de MiMuR */
(() => {
  const abrir = document.getElementById("openAccount");
  const cerrar = document.getElementById("closeAccount");
  const ventana = document.getElementById("accountDialog");

  if (!abrir || !cerrar || !ventana) {
    console.error("MiMuR: falta el botón o la ventana de cuenta.");
    return;
  }

  abrir.addEventListener("click", () => {
    if (typeof ventana.showModal === "function") {
      ventana.showModal();
    } else {
      ventana.setAttribute("open", "");
    }
  });

  cerrar.addEventListener("click", () => {
    if (typeof ventana.close === "function") {
      ventana.close();
    } else {
      ventana.removeAttribute("open");
    }
  });

  ventana.addEventListener("click", (evento) => {
    if (evento.target === ventana) {
      ventana.close();
    }
  });
})();

/* MiMuR: mantener actualizado el estado de la cuenta */
(() => {
  const botonCuenta = document.getElementById("openAccount");
  const botonCerrarSesion = document.getElementById("signOut");
  const botonCrear = document.getElementById("signUp");
  const botonEntrar = document.getElementById("signIn");
  const ventanaCuenta = document.getElementById("accountDialog");
  const mensaje = document.getElementById("authMsg");

  function actualizarInterfaz(sesion) {
    const conectado = Boolean(sesion?.user);

    if (botonCuenta) {
      botonCuenta.textContent = conectado ? "Mi cuenta ✓" : "Mi cuenta";
    }

    if (botonCerrarSesion) {
      botonCerrarSesion.hidden = !conectado;
    }

    if (botonCrear) {
      botonCrear.hidden = conectado;
    }

    if (botonEntrar) {
      botonEntrar.hidden = conectado;
    }
  }

  // Recuperar la sesión existente al cargar la página
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("MiMuR: no se pudo consultar la sesión.", error);
      return;
    }

    actualizarInterfaz(data.session);
  });

  // Actualizar la interfaz cuando cambie la sesión
  supabaseClient.auth.onAuthStateChange((_evento, sesion) => {
    actualizarInterfaz(sesion);
  });

  // Cerrar la sesión actual
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", async () => {
      botonCerrarSesion.disabled = true;

      const { error } = await supabaseClient.auth.signOut();

      botonCerrarSesion.disabled = false;

      if (error) {
        if (mensaje) {
          mensaje.textContent =
            "No se pudo cerrar la sesión: " + error.message;
        }
        return;
      }

      if (ventanaCuenta?.open) {
        ventanaCuenta.close();
      }

const formularioMusico = document.getElementById("lead");

if (formularioMusico) {
  formularioMusico.reset();
}

const mensajeMusico = document.getElementById("leadMsg");

if (mensajeMusico) {
  mensajeMusico.textContent =
    "Inicia sesión para consultar o editar tu perfil de músico.";
}


      
      if (mensaje) {
        mensaje.textContent = "Has cerrado sesión correctamente.";
      }
    });
  }
})();
