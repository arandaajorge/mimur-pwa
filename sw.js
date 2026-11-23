
const CACHE = "mimur-pwa-v3";

const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];

// Instalar la nueva versión.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Eliminar versiones anteriores.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) =>
              key.startsWith("mimur-pwa-") &&
              key !== CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Internet primero; caché como respaldo.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // No interceptar solicitudes ajenas al sitio.
  if (!["http:", "https:"].includes(url.protocol)) {
    return;
  }

  // Usar una URL estable para la caché.
  const cacheUrl = new URL(url.href);
  cacheUrl.searchParams.delete("v");

  const cacheKey = cacheUrl.href;

  event.respondWith(
    fetch(request, { cache: "no-store" })
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const copia = response.clone();

          event.waitUntil(
            caches.open(CACHE).then((cache) =>
              cache.put(cacheKey, copia)
            )
          );
        }

        return response;
      })
      .catch(async () => {
        const cache = await caches.match(cacheKey);

        if (cache) return cache;

        if (request.mode === "navigate") {
          const inicio = await caches.match(
            new URL("./index.html", self.registration.scope).href
          );

          if (inicio) return inicio;
        }

        return Response.error();
      })
  );
});
