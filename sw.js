const CACHE = "mimur-pwa-v4";

const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];

// Archivos estáticos autorizados.
const ALLOWED_FILES = new Set(
  FILES.map(file =>
    new URL(file, self.registration.scope).href
  )
);

// Instalar la nueva versión.
self.addEventListener("install", (event) => {

  event.waitUntil(
    caches.open(CACHE)
      .then(cache =>
        cache.addAll(
          FILES.map(file =>
            new Request(
              new URL(file, self.registration.scope),
              { cache: "reload" }
            )
          )
        )
      )
      .then(() => self.skipWaiting())
  );

});

// Eliminar versiones anteriores de MiMuR.
self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith("mimur-pwa-") &&
              key !== CACHE
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );

});

// Internet primero y caché como respaldo.
self.addEventListener("fetch", (event) => {

  const request = event.request;
  const url = new URL(request.url);

  // Excluir operaciones distintas de GET.
  if (request.method !== "GET") return;

  // Excluir servicios externos, incluido Supabase.
  if (url.origin !== self.location.origin) return;

  if (!["http:", "https:"].includes(url.protocol)) {
    return;
  }

  // Autorizar únicamente archivos estáticos conocidos.
  const baseUrl = new URL(url.href);
  baseUrl.search = "";
  baseUrl.hash = "";

  if (!ALLOWED_FILES.has(baseUrl.href)) return;

  // No almacenar solicitudes con parámetros.
  const puedeGuardar = url.search === "";

  event.respondWith(
    (async () => {

      try {

        const response = await fetch(request, {
          cache: "no-store"
        });

        if (
          puedeGuardar &&
          response.ok &&
          response.type === "basic" &&
          !response.redirected
        ) {

          try {

            const cache = await caches.open(CACHE);

            await cache.put(
              request,
              response.clone()
            );

          } catch (error) {

            console.warn(
              "MiMuR: no se pudo actualizar la caché.",
              error
            );

          }

        }

        return response;

      } catch (error) {

        const cache = await caches.open(CACHE);

        if (puedeGuardar) {

          const guardado = await cache.match(request);

          if (guardado) return guardado;

        }

        if (request.mode === "navigate") {

          const inicio = await cache.match(
            new URL(
              "./index.html",
              self.registration.scope
            ).href
          );

          if (inicio) return inicio;

        }

        return Response.error();

      }

    })()
  );

});
