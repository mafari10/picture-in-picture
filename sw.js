const CACHE_NAME = "pip-cache-v4"; // Updated version
const BASE_PATH = self.location.hostname.includes("github.io")
  ? "/mafari10"
  : "";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/js/script.js",
  "/assets/css/styles.css",
  "/favicon.ico",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/manifest.json",
].map((path) => BASE_PATH + path);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache
            .add(
              new Request(url, {
                cache: "reload",
                credentials: "same-origin",
              })
            )
            .catch((err) => {
              console.error(`Failed to cache ${url}:`, err);
              return Promise.resolve(); // Continue despite failures
            });
        })
      );
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and extension requests
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  // Handle navigation requests specially
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(BASE_PATH + "/index.html").then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Only cache successful, same-origin responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic" ||
            !response.url.startsWith(self.location.origin)
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fallback for failed requests
          if (event.request.destination === "image") {
            return caches.match(BASE_PATH + "/assets/icons/icon-512x512.png");
          }
          return new Response("Offline fallback page", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Enable navigation preload if supported
        if (self.registration.navigationPreload) {
          return self.registration.navigationPreload.enable();
        }
      })
      .then(() => {
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});
