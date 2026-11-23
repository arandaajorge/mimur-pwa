

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
  price: m.event_price_mxn ?? m.minimum_price_mxn ?? m.hourly_price_mxn,
eventPrice: m.event_price_mxn ?? null,
hourlyPrice: m.hourly_price_mxn ?? null,
pricingNotes: m.pricing_notes || "",
eventPrice: m.event_price_mxn ?? null,
hourlyPrice: m.hourly_price_mxn ?? null,
pricingNotes: m.pricing_notes || "",
unit:
  m.event_price_mxn == null &&
  m.minimum_price_mxn == null &&
  m.hourly_price_mxn != null
    ? "hora"
    : "evento",
  icon: "🎤",
  bio: m.bio || "Este músico aún no ha agregado su biografía.",
experience: m.experience || "",
repertoire: m.repertoire || [],
members: m.members || [],
equipment: m.equipment || "",
services: m.services || [],
photoUrls: m.photo_urls || [],
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

  
if (formulario.elements.eventPrice) {
  formulario.elements.eventPrice.value =
    perfil.event_price_mxn ?? perfil.minimum_price_mxn ?? "";
}

if (formulario.elements.hourlyPrice) {
  formulario.elements.hourlyPrice.value =
    perfil.hourly_price_mxn ?? "";
}

if (formulario.elements.pricingNotes) {
  formulario.elements.pricingNotes.value =
    perfil.pricing_notes || "";
}


  if (formulario.elements.phone) {
    formulario.elements.phone.value = perfil.phone || "";
  }

  formulario.elements.zone.value = perfil.zone || "";
  formulario.elements.genre.value = perfil.genres?.[0] || "";
  formulario.elements.video.value = perfil.video_url || "";

formulario.elements.emergency.checked =
  perfil.emergency_opt_in === true;
  if (formulario.elements.bio) {
  formulario.elements.bio.value = perfil.bio || "";
}

if (formulario.elements.experience) {
  formulario.elements.experience.value = perfil.experience || "";
}

if (formulario.elements.repertoire) {
  formulario.elements.repertoire.value =
    Array.isArray(perfil.repertoire)
      ? perfil.repertoire.join("\n")
      : "";
}

if (formulario.elements.members) {
  formulario.elements.members.value =
    Array.isArray(perfil.members)
      ? perfil.members.join("\n")
      : "";
}

if (formulario.elements.equipment) {
  formulario.elements.equipment.value = perfil.equipment || "";
}

if (formulario.elements.services) {
  formulario.elements.services.value =
    Array.isArray(perfil.services)
      ? perfil.services.join("\n")
      : "";
}
if (formulario.elements.photo_urls) {
  formulario.elements.photo_urls.value =
    Array.isArray(perfil.photo_urls)
      ? perfil.photo_urls.join("\n")
      : "";
}
  // Mostrar fotografías existentes del músico.
const listaFotos = document.getElementById("listaMisFotos");

if (listaFotos) {
  listaFotos.replaceChildren();

  const fotos = Array.isArray(perfil.photo_urls)
    ? perfil.photo_urls
    : [];

  fotos.forEach((url, indice) => {
    const contenedor = document.createElement("div");

    contenedor.style.cssText = `
      display: inline-flex;
      flex-direction: column;
      gap: 8px;
      margin: 8px;
      vertical-align: top;
    `;

    const imagen = document.createElement("img");
    imagen.src = url;
    imagen.alt = `Fotografía ${indice + 1}`;
    imagen.loading = "lazy";

    imagen.style.cssText = `
      width: 130px;
      height: 130px;
      object-fit: cover;
      border-radius: 12px;
    `;

    const botonEliminar = document.createElement("button");
botonEliminar.type = "button";
botonEliminar.textContent = "Eliminar foto";

botonEliminar.onclick = async () => {
  const confirmar = confirm(
    "¿Seguro que deseas eliminar esta fotografía?"
  );

  if (!confirmar) return;

  botonEliminar.disabled = true;
  botonEliminar.textContent = "Eliminando...";

  try {
    const { data: { user }, error: authError } =
      await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Debes iniciar sesión.");
    }

    const bucket = "musician-photos";

    const prefijo =
      `/storage/v1/object/public/${bucket}/`;

    const urlFoto = new URL(url);

    if (
      urlFoto.origin !== new URL(SUPABASE_URL).origin ||
      !urlFoto.pathname.startsWith(prefijo)
    ) {
      throw new Error("La fotografía no pertenece a MiMuR.");
    }

    const ruta = decodeURIComponent(
      urlFoto.pathname.slice(prefijo.length)
    );

    if (!ruta.startsWith(`${user.id}/`)) {
      throw new Error("No puedes eliminar esta fotografía.");
    }

    // Quitar la URL del perfil.
    const fotosActualizadas = fotos.filter(
      foto => foto !== url
    );

    const { error: errorPerfil } =
      await supabaseClient
        .from("musicians")
        .update({ photo_urls: fotosActualizadas })
        .eq("user_id", user.id);

    if (errorPerfil) throw errorPerfil;

    // Eliminar el archivo de Supabase Storage.
    const { error: errorStorage } =
      await supabaseClient.storage
        .from(bucket)
        .remove([ruta]);

    if (errorStorage) throw errorStorage;

    await cargarMiPerfilMusico();
await cargarMusicosAprobados();

// Actualizar la galería pública si está visible.
const perfilPublico = document.getElementById(
  "perfilPublicoMusico"
);

if (perfilPublico && !perfilPublico.hidden) {
  const galeriaPublica = document.getElementById(
    "perfilPublicoGaleria"
  );

  if (galeriaPublica) {
    const imagenes = galeriaPublica.querySelectorAll("img");

    imagenes.forEach(imagen => {
      if (imagen.src === url) {
        imagen.remove();
      }
    });

    if (!galeriaPublica.querySelector("img")) {
      galeriaPublica.replaceChildren();
    }
  }
}

alert("Fotografía eliminada correctamente.");
  } catch (error) {
    console.error("Error al eliminar fotografía:", error);

    alert(
      "No se pudo completar la eliminación: " +
      error.message
    );

    await cargarMiPerfilMusico();
  } finally {
    botonEliminar.disabled = false;
    botonEliminar.textContent = "Eliminar foto";
  }
};
    contenedor.append(imagen, botonEliminar);
    listaFotos.appendChild(contenedor);
  });
}
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

async function cargarContratacionesCliente() {
  const lista = document.getElementById(
    "listaContratacionesCliente"
  );

  const estado = document.getElementById(
    "estadoContratacionesCliente"
  );

  if (!lista || !estado) return;

  const { data: { user }, error: authError } =
    await supabaseClient.auth.getUser();

  if (authError || !user) {
    lista.replaceChildren();
    estado.textContent =
      "Inicia sesión para consultar tus contrataciones.";
    return;
  }

  const usuarioId = user.id;

  estado.textContent = "Cargando tus solicitudes...";
  lista.replaceChildren();

  const { data: solicitudes, error } =
    await supabaseClient
      .from("event_requests")
      
.select(`
  id,
  event_type,
  event_date,
  zone,
  genre,
  budget_mxn,
  status,
  created_at,
  offers (
    id,
    status,
    musician_price_mxn,
    commission_bps,
    customer_total_mxn,
    musicians (
      artist_name
    )
  )
`)

      .eq("customer_id", usuarioId)
      .order("created_at", { ascending: false });

  // Evitar mostrar datos si cambió la sesión.
  const { data: { user: usuarioActual } } =
    await supabaseClient.auth.getUser();

  if (usuarioActual?.id !== usuarioId) return;

  if (error) {
    console.error("Error al cargar solicitudes:", error);
    estado.textContent =
      "No se pudieron cargar tus solicitudes: " +
      error.message;
    return;
  }

  if (!solicitudes || solicitudes.length === 0) {
    estado.textContent =
      "Todavía no has realizado solicitudes de contratación.";
    return;
  }

  estado.textContent =
    `Tienes ${solicitudes.length} solicitud(es) registrada(s).`;

  solicitudes.forEach((solicitud) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "oferta-musico-card";

    const titulo = document.createElement("h3");
    titulo.textContent =
      solicitud.event_type || "Evento musical";

    const fecha = document.createElement("p");
    fecha.textContent =
      "Fecha: " +
      new Date(solicitud.event_date).toLocaleString(
        "es-MX",
        {
          dateStyle: "medium",
          timeStyle: "short"
        }
      );

    const zona = document.createElement("p");
    zona.textContent = "Zona: " + solicitud.zone;

    const genero = document.createElement("p");
    genero.textContent =
      "Género musical: " + solicitud.genre;

    const presupuesto = document.createElement("p");
    presupuesto.textContent =
      "Presupuesto: " + money(solicitud.budget_mxn);

    const estadoSolicitud = document.createElement("p");
    estadoSolicitud.textContent =
      "Estado de la solicitud: " + solicitud.status;

    
  });
    tarjeta.append(
      titulo,
      fecha,
      zona,
      genero,
      presupuesto,
      estadoSolicitud
    );

    // Mostrar las cotizaciones de esta solicitud.
    const tituloCotizaciones = document.createElement("h4");
    tituloCotizaciones.textContent = "Cotizaciones de músicos";

    tarjeta.appendChild(tituloCotizaciones);

    const ofertas = Array.isArray(solicitud.offers)
      ? solicitud.offers
      : [];

    if (ofertas.length === 0) {
      const sinOfertas = document.createElement("p");
      sinOfertas.textContent =
        "Todavía no hay músicos que hayan recibido esta solicitud.";

      tarjeta.appendChild(sinOfertas);
    } else {
      ofertas.forEach((oferta) => {
        const contenedor = document.createElement("div");
        contenedor.className = "cotizacion-cliente";

        const musico = Array.isArray(oferta.musicians)
          ? oferta.musicians[0]
          : oferta.musicians;

        const nombre = document.createElement("p");
        nombre.textContent =
          "Músico: " +
          (musico?.artist_name || "Artista MiMuR");

        const estadoOferta = document.createElement("p");

        const estados = {
          pending: "Esperando respuesta del músico",
          accepted: "Cotización recibida",
          declined: "El músico rechazó la solicitud",
          withdrawn: "Oferta retirada"
        };

        estadoOferta.textContent =
          "Estado: " +
          (estados[oferta.status] || oferta.status);

        contenedor.append(nombre, estadoOferta);

        if (
          oferta.status === "accepted" &&
          oferta.musician_price_mxn != null &&
          oferta.customer_total_mxn != null
        ) {
          const honorarios = Number(
            oferta.musician_price_mxn
          );

          const total = Number(
            oferta.customer_total_mxn
          );

          const comision = total - honorarios;

          const precioMusico = document.createElement("p");
          precioMusico.textContent =
            "Honorarios del músico: " + money(honorarios);

          const precioComision = document.createElement("p");
          precioComision.textContent =
            "Comisión MiMuR: " + money(comision);

          const precioTotal = document.createElement("p");
          const destacado = document.createElement("strong");

          destacado.textContent =
            "Total de la cotización: " + money(total);

          precioTotal.appendChild(destacado);

          const aviso = document.createElement("p");
          aviso.textContent =
            "Cotización disponible. Pendiente de confirmación del cliente.";

          contenedor.append(
            precioMusico,
            precioComision,
            precioTotal,
            aviso
          );
        }

        tarjeta.appendChild(contenedor);
      });
    }

    lista.appendChild(tarjeta);

}

const botonActualizarContrataciones = document.getElementById(
  "actualizarContratacionesCliente"
);

if (botonActualizarContrataciones) {
  botonActualizarContrataciones.addEventListener(
    "click",
    cargarContratacionesCliente
  );
}

function actualizarPanelCliente(usuario) {
  const panel = document.getElementById("panelCliente");
  const estado = document.getElementById(
    "estadoContratacionesCliente"
  );
  const lista = document.getElementById(
    "listaContratacionesCliente"
  );

  if (!panel) return;

  // El panel solo aparece cuando existe una sesión.
  panel.hidden = !usuario;

  if (!usuario) {
    // Limpiar información de la sesión anterior.
    if (lista) {
      lista.replaceChildren();
    }

    if (estado) {
      estado.textContent =
        "Inicia sesión para consultar tus contrataciones.";
    }

    return;
  }

  if (estado) {
    estado.textContent =
      "Tu cuenta está activa. Ya puedes consultar tus solicitudes.";
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
    event_request_id,
    
musician_price_mxn,
commission_bps,
customer_total_mxn,
status,

    musician_note,
    created_at,
    event_requests!offers_event_request_id_fkey (
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
      
<p><strong>Tus honorarios:</strong> ${escapar(pesos(oferta.musician_price_mxn))}</p>
<p><strong>Comisión MiMuR:</strong> ${escapar(
  oferta.musician_price_mxn == null ||
  oferta.customer_total_mxn == null
    ? "Pendiente de cotización"
    : pesos(
        oferta.customer_total_mxn -
        oferta.musician_price_mxn
      )
)}</p>
<p><strong>Total para el cliente:</strong> ${escapar(pesos(oferta.customer_total_mxn))}</p>

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
  let precio = null;

  if (decision === "accepted") {
    const entrada = prompt(
      "¿Cuánto deseas cobrar por este evento? Ingresa tus honorarios en MXN:"
    );

    if (entrada === null) return;

    const valor = entrada.trim();

    if (!/^[1-9]\d*$/.test(valor)) {
      alert("Ingresa un precio válido, sin decimales ni símbolos.");
      return;
    }

    precio = Number(valor);

    if (!Number.isSafeInteger(precio) || precio > 1952257861) {
      alert("El precio ingresado es demasiado alto.");
      return;
    }

    const comision = Math.ceil(precio * 0.10);
    const total = precio + comision;

    const formato = n =>
      n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
      });

    const confirmado = confirm(
      "RESUMEN DE TU COTIZACIÓN\n\n" +
      "Tus honorarios: " + formato(precio) + "\n" +
      "Comisión MiMuR (10%): " + formato(comision) + "\n" +
      "Total para el cliente: " + formato(total) + "\n\n" +
      "¿Deseas enviar esta cotización?"
    );

    if (!confirmado) return;

  } else if (decision === "declined") {
    if (!confirm("¿Confirmas que deseas rechazar esta oferta?")) {
      return;
    }
  } else {
    alert("Decisión no válida.");
    return;
  }

  botonAceptar.disabled = true;
  botonRechazar.disabled = true;

  try {
    const { error } = await supabaseClient.rpc(
      "responder_oferta_musico",
      {
        p_offer_id: ofertaId,
        p_decision: decision,
        p_precio_mxn: precio
      }
    );

    if (error) throw error;

    alert(
      decision === "accepted"
        ? "¡Cotización enviada correctamente! El cliente deberá confirmar la contratación."
        : "Oferta rechazada correctamente."
    );

    await cargarSolicitudesMusico();

  } catch (error) {
    console.error("Error al responder oferta:", error);

    alert(
      "No se pudo responder la oferta: " + error.message
    );

    botonAceptar.disabled = false;
    botonRechazar.disabled = false;
  }
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
  const detalles = [
    ["Experiencia", musico.experience],
    ["Integrantes", musico.members],
    ["Equipo", musico.equipment],
    ["Servicios", musico.services],
    ["Repertorio", musico.repertoire]
  ];

  let contenedorDetalles =
    document.getElementById("perfilPublicoDetalles");

  if (!contenedorDetalles) {
    contenedorDetalles = document.createElement("div");
    contenedorDetalles.id = "perfilPublicoDetalles";

    document.getElementById("perfilPublicoBio")
      .insertAdjacentElement("afterend", contenedorDetalles);
  }

  contenedorDetalles.replaceChildren();
  const fotos = Array.isArray(musico.photoUrls)
    ? musico.photoUrls
    : [];

  let galeria = document.getElementById("perfilPublicoGaleria");

  if (!galeria) {
    galeria = document.createElement("div");
    galeria.id = "perfilPublicoGaleria";
    contenedorDetalles.insertAdjacentElement("afterend", galeria);
  }

  galeria.replaceChildren();

  
if (fotos.length) {
  const fotosValidas = fotos.filter((foto) => {
    try {
      return new URL(foto).protocol === "https:";
    } catch {
      return false;
    }
  });

  if (fotosValidas.length) {
    const titulo = document.createElement("h3");
    titulo.textContent = "Galería del artista";
    galeria.appendChild(titulo);

    const carrusel = document.createElement("div");
    carrusel.className = "mimur-carrusel";

    const imagen = document.createElement("img");
    imagen.className = "mimur-carrusel-imagen";
    imagen.alt = `Fotografía de ${musico.name}`;

    const anterior = document.createElement("button");
    anterior.type = "button";
    anterior.className = "mimur-carrusel-anterior";
    anterior.textContent = "❮";
    anterior.setAttribute("aria-label", "Fotografía anterior");

    const siguiente = document.createElement("button");
    siguiente.type = "button";
    siguiente.className = "mimur-carrusel-siguiente";
    siguiente.textContent = "❯";
    siguiente.setAttribute("aria-label", "Fotografía siguiente");

    const contador = document.createElement("span");
    contador.className = "mimur-carrusel-contador";
    contador.setAttribute("aria-live", "polite");

    
let indice = 0;
let solicitudActual = 0;

// Guardar en memoria las fotografías ya descargadas.
const imagenesPrecargadas = new Map();

function precargarFoto(posicion) {
  const url = fotosValidas[posicion];

  if (!url || imagenesPrecargadas.has(url)) return;

  const precarga = new Image();

  imagenesPrecargadas.set(url, precarga);

  precarga.onload = () => {
    console.log("MiMuR: fotografía cargada", posicion + 1);
  };

  precarga.onerror = () => {
    imagenesPrecargadas.delete(url);
    console.warn("MiMuR: no se pudo cargar la fotografía", posicion + 1);
  };

  precarga.src = url;
}

function mostrarFoto() {
  const solicitud = ++solicitudActual;
  const url = fotosValidas[indice];

  contador.textContent =
    `${indice + 1} / ${fotosValidas.length}`;

  anterior.hidden = fotosValidas.length <= 1;
  siguiente.hidden = fotosValidas.length <= 1;

  // Mostrar la fotografía únicamente cuando esté descargada.
  imagen.style.opacity = "0.35";

  const precarga = imagenesPrecargadas.get(url) || new Image();

  imagenesPrecargadas.set(url, precarga);

  const mostrarImagen = () => {
    if (solicitud !== solicitudActual) return;

    imagen.src = url;
    imagen.style.opacity = "1";
  };

  const mostrarError = () => {
    if (solicitud !== solicitudActual) return;

    imagen.removeAttribute("src");
    imagen.alt = "No se pudo cargar esta fotografía";
    imagen.style.opacity = "1";
    imagenesPrecargadas.delete(url);
  };

  if (precarga.complete && precarga.naturalWidth > 0) {
    mostrarImagen();
  } else {
    imagen.removeAttribute("src");
    precarga.onload = mostrarImagen;
    precarga.onerror = mostrarError;
    precarga.src = url;
  }

  // Preparar las fotografías vecinas.
  if (fotosValidas.length > 1) {
    precargarFoto((indice + 1) % fotosValidas.length);
    precargarFoto(
      (indice - 1 + fotosValidas.length) % fotosValidas.length
    );
  }
}

    anterior.onclick = () => {
      indice = (indice - 1 + fotosValidas.length)
        % fotosValidas.length;
      mostrarFoto();
    };

    siguiente.onclick = () => {
      indice = (indice + 1) % fotosValidas.length;
      mostrarFoto();
    };

    // Deslizar fotografías desde el celular.
    let inicioX = null;

    carrusel.addEventListener("touchstart", (e) => {
      inicioX = e.changedTouches[0].screenX;
    }, { passive: true });

    carrusel.addEventListener("touchend", (e) => {
      if (inicioX === null) return;

      const diferencia =
        e.changedTouches[0].screenX - inicioX;

      inicioX = null;

      if (Math.abs(diferencia) < 50) return;

      if (diferencia < 0) {
        siguiente.click();
      } else {
        anterior.click();
      }
    }, { passive: true });

    carrusel.append(
      imagen,
      anterior,
      siguiente,
      contador
    );

    galeria.appendChild(carrusel);
    mostrarFoto();
    
    // Abrir fotografía en pantalla completa.
    imagen.style.cursor = "zoom-in";
    imagen.title = "Toca para ampliar la fotografía";

    imagen.onclick = () => {
      const visor = document.createElement("div");
      visor.className = "mimur-visor-fotos";

      const fotoGrande = document.createElement("img");
      fotoGrande.className = "mimur-visor-imagen";
      fotoGrande.alt = "Fotografía ampliada del artista";

      const cerrar = document.createElement("button");
      cerrar.type = "button";
      cerrar.className = "mimur-visor-cerrar";
      cerrar.textContent = "×";
      cerrar.setAttribute("aria-label", "Cerrar fotografía");

      const atras = document.createElement("button");
      atras.type = "button";
      atras.className = "mimur-visor-atras";
      atras.textContent = "❮";
      atras.setAttribute("aria-label", "Fotografía anterior");

      const adelante = document.createElement("button");
      adelante.type = "button";
      adelante.className = "mimur-visor-adelante";
      adelante.textContent = "❯";
      adelante.setAttribute("aria-label", "Fotografía siguiente");

      const numero = document.createElement("span");
      numero.className = "mimur-visor-numero";

      let posicion = indice;

      function actualizarVisor() {
        fotoGrande.src = fotosValidas[posicion];
        numero.textContent =
          `${posicion + 1} / ${fotosValidas.length}`;

        atras.hidden = fotosValidas.length <= 1;
        adelante.hidden = fotosValidas.length <= 1;
      }

      function cerrarVisor() {
        visor.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", teclado);
      }

      function teclado(e) {
        if (e.key === "Escape") cerrarVisor();
        if (e.key === "ArrowRight") adelante.click();
        if (e.key === "ArrowLeft") atras.click();
      }

      cerrar.onclick = cerrarVisor;

      atras.onclick = () => {
        posicion =
          (posicion - 1 + fotosValidas.length) %
          fotosValidas.length;
        actualizarVisor();
      };

      adelante.onclick = () => {
        posicion = (posicion + 1) % fotosValidas.length;
        actualizarVisor();
      };

      let inicioX = null;

      fotoGrande.addEventListener("touchstart", (e) => {
        inicioX = e.changedTouches[0].screenX;
      }, { passive: true });

      fotoGrande.addEventListener("touchend", (e) => {
        if (inicioX === null) return;

        const diferencia =
          e.changedTouches[0].screenX - inicioX;

        inicioX = null;

        if (Math.abs(diferencia) < 50) return;

        if (diferencia < 0) adelante.click();
        else atras.click();
      }, { passive: true });

      visor.onclick = (e) => {
        if (e.target === visor) cerrarVisor();
      };

      visor.append(
        fotoGrande,
        cerrar,
        atras,
        adelante,
        numero
      );

      document.body.appendChild(visor);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", teclado);

      actualizarVisor();
    };

  }
}

  detalles.forEach(([titulo, valor]) => {
    const elementos = Array.isArray(valor)
      ? valor
      : valor ? [valor] : [];

    if (!elementos.length) return;

    const seccion = document.createElement("div");
    const encabezado = document.createElement("h4");
    const contenido = document.createElement("p");

    encabezado.textContent = titulo;
    contenido.textContent = elementos.join(" · ");

    seccion.append(encabezado, contenido);
    contenedorDetalles.appendChild(seccion);
  });
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
        

const videoId = url.pathname.startsWith("/shorts/")
  ? url.pathname.split("/")[2]
  : url.pathname.startsWith("/live/")
    ? url.pathname.split("/")[2]
    : url.pathname.startsWith("/embed/")
      ? url.pathname.split("/")[2]
      : url.searchParams.get("v");

        if (videoId && /^[\w-]{11}$/.test(videoId)) {
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
          iframe.title = `Video de ${musico.name || "artista MiMuR"}`;
          iframe.loading = "lazy";
          iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
          iframe.allowFullscreen = true;
          iframe.style.width = "100%";
          
const esShort = url.pathname.startsWith("/shorts/");

iframe.style.aspectRatio = esShort ? "9 / 16" : "16 / 9";

iframe.style.maxWidth = esShort ? "320px" : "100%";

iframe.style.margin = esShort ? "0 auto" : "0";

iframe.style.display = "block";

iframe.style.borderRadius = "14px";

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
    const coincideBusqueda =
      !q ||
      normalizar(`${m.name} ${m.genre} ${m.zone}`).includes(
        normalizar(q)
      );

    const coincideGenero =
      !g || normalizar(m.genre) === normalizar(g);

    const coincideZona =
      !z || normalizar(m.zone) === normalizar(z);

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

            <button type="button" data-profile-id="${safe(id)}">
              Ver perfil
            </button>

            <button type="button" data-id="${safe(id)}">
              Solicitar
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $("empty").hidden = filas.length > 0;

  document.querySelectorAll("#musicians [data-profile-id]").forEach((b) => {
    b.onclick = () => {
      const musico = catalogo.find(
        (m) => String(m.id) === b.dataset.profileId
      );

      if (musico) {
        abrirPerfilPublicoMusico(musico);
      }
    };
  });

  document.querySelectorAll("#musicians [data-id]").forEach((b) => {
    b.onclick = () => {
      const musico = catalogo.find(
        (m) => String(m.id) === b.dataset.id
      );

      if (musico) {
        openRequest(musico);
      }
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

    
const { data: solicitudGuardada, error } = await supabaseClient
  .from("event_requests")
  .insert(solicitud)
  .select("id")
  .single();

if (error) {
  console.error("Error al guardar solicitud:", error);
  mensaje.textContent =
    "No se pudo guardar la solicitud: " + error.message;
  return;
}

mensaje.textContent = "Solicitud guardada. Buscando músicos compatibles...";

const { data: cantidad, error: errorDistribucion } =
  await supabaseClient.rpc("distribuir_solicitud_musical", {
    p_event_request_id: solicitudGuardada.id
  });

if (errorDistribucion) {
  console.error("Error al distribuir solicitud:", errorDistribucion);
  mensaje.textContent =
    "La solicitud se guardó, pero no se pudo avisar a los músicos: " +
    errorDistribucion.message;
  return;
}

mensaje.textContent = cantidad > 0
  ? `¡Solicitud publicada! Se notificó a ${cantidad} músico(s) compatible(s).`
  : "La solicitud se guardó, pero todavía no hay músicos aprobados disponibles que coincidan con el género y la zona.";
f.reset();

setTimeout(() => $("request").close(), 3000);

    



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


// Conservar las fotografías que ya tiene el músico.
const { data: fotosActuales, error: fotosError } =
  await supabaseClient
    .from("musicians")
    .select("photo_urls")
    .eq("user_id", user.id)
    .maybeSingle();

if (fotosError) throw fotosError;

const photoUrls = Array.isArray(fotosActuales?.photo_urls)
  ? [...fotosActuales.photo_urls]
  : [];

// Obtener las fotografías seleccionadas desde el celular.
const archivos = Array.from(
  f.elements.photo_files?.files || []
);

if (archivos.length > 10) {
  throw new Error("Puedes subir un máximo de 10 fotografías por vez.");
}

for (let i = 0; i < archivos.length; i++) {
  const archivo = archivos[i];

  if (!archivo.type.startsWith("image/")) {
    throw new Error("Solo puedes subir archivos de imagen.");
  }

  if (archivo.size > 10 * 1024 * 1024) {
  throw new Error("Cada fotografía debe pesar máximo 10 MB.");
}

  const nombreArchivo =
    `${Date.now()}-${i}-${archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const ruta = `${user.id}/${nombreArchivo}`;

  const { error: subidaError } =
    await supabaseClient.storage
      .from("musician-photos")
      .upload(ruta, archivo, {
        contentType: archivo.type,
        upsert: false
      });

  if (subidaError) throw subidaError;

  const { data: urlPublica } =
    supabaseClient.storage
      .from("musician-photos")
      .getPublicUrl(ruta);

  photoUrls.push(urlPublica.publicUrl);
}
const perfil = {
  artist_name: d.name.trim(),
  phone: d.phone.trim(),
  genres: [d.genre],
    zone: d.zone.trim(),
  video_url: d.video.trim(),

  bio: d.bio ? d.bio.trim() : "",

  experience: d.experience
    ? d.experience.trim()
    : "",

  repertoire: (d.repertoire || "")
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean),

  members: (d.members || "")
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean),

  equipment: d.equipment
    ? d.equipment.trim()
    : "",

  services: (d.services || "")
    .split(/\r?\n/)
    .map(x => x.trim())
    .filter(Boolean),
  

  // Tarifas nuevas
  event_price_mxn:
    d.eventPrice !== undefined && d.eventPrice.trim() !== ""
      ? Number(d.eventPrice)
      : null,

  hourly_price_mxn:
    d.hourlyPrice !== undefined && d.hourlyPrice.trim() !== ""
      ? Number(d.hourlyPrice)
      : null,

  pricing_notes: d.pricingNotes
    ? d.pricingNotes.trim()
    : "",

  // Compatibilidad con el precio anterior
  minimum_price_mxn:
    d.eventPrice !== undefined && d.eventPrice.trim() !== ""
      ? Number(d.eventPrice)
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
// Guardar las fotografías sin perder las existentes.
if (archivos.length > 0) {
  const { data: perfilActual, error: lecturaError } =
    await supabaseClient
      .from("musicians")
      .select("photo_urls")
      .eq("user_id", user.id)
      .single();

  if (lecturaError) throw lecturaError;

  const fotosExistentes = Array.isArray(perfilActual.photo_urls)
    ? perfilActual.photo_urls
    : [];

  const fotosNuevas = photoUrls.filter(
    url => !fotosExistentes.includes(url)
  );

  const { error: errorFotos } =
    await supabaseClient
      .from("musicians")
      .update({
        photo_urls: [...fotosExistentes, ...fotosNuevas]
      })
      .eq("user_id", user.id);

  if (errorFotos) throw errorFotos;
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
    const usuario = session?.user || null;

    // Actualizar el panel del cliente.
    actualizarPanelCliente(usuario);

    if (usuario) {
      // Cargar información del músico, si tiene perfil.
      await cargarMiPerfilMusico();

      // Recuperar favoritos del usuario.
      await cargarFavoritos();

    } else {
      // Ocultar el panel del músico.
      actualizarPanelMusico(null, null);

      // Ocultar solicitudes de la sesión anterior.
      const solicitudes = document.getElementById(
        "contenidoSolicitudesMusico"
      );

      if (solicitudes) {
        solicitudes.hidden = true;
        solicitudes.replaceChildren();
      }

      // Limpiar formulario del músico.
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
