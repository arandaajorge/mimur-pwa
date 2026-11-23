
const CACHE = "mimur-pwa-v2";

const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/icon.svg"
];

// Instalar y almacenar archivos principales.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Eliminar cachés anteriores.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Consultar internet primero y usar caché si falla.
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copia = response.clone();

          event.waitUntil(
            caches.open(CACHE).then((cache) =>
              cache.put(request, copia)
            )
          );
        }

        return response;
      })
      .catch(async () => {
        const cache = await caches.match(request);

        if (cache) return cache;

        if (request.mode === "navigate") {
          const inicio = await caches.match("./index.html");
          if (inicio) return inicio;
        }

        return Response.error();
      })
  );
});
