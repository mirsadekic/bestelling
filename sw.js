const CACHE_NAME = "alanya-bestellijst-v21";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",

  // icons (zoals jij ze nu hebt)
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS);
      await self.skipWaiting(); // direct nieuwe SW gebruiken
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
      await self.clients.claim(); // direct controle over open tabs
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Alleen GET requests cachen
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const fresh = await fetch(event.request);
        // Optioneel: cache nieuw opgehaalde bestanden ook
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch (err) {
        // Offline fallback: probeer index (voor navigatie)
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("./index.html");
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});





