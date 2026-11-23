const CACHE_NAME = "alert-activity-v5";
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key.startsWith("alert-activity-") && key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => (await caches.match(request)) || caches.match("./index.html"))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(request).then((response) => {
                if (!response.ok) return response;
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                return response;
            });
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clients) => {
                const client = clients.find((item) => "focus" in item);
                if (client) return client.focus();
                const url = event.notification.data && event.notification.data.url
                    ? event.notification.data.url
                    : "./index.html";
                return self.clients.openWindow(url);
            })
    );
});