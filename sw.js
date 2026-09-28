/* ============================================================
   Service Worker — офлайн-режим и установка PWA.
   Стратегия: cache-first с сетевой проверкой обновлений навигации.
   ============================================================ */

const CACHE_NAME = "order-board-pwa-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/data.js",
  "./js/render.js",
  "./js/stations.js",
  "./js/character.js",
  "./js/engine.js",
  "./js/demo.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  // Слайд-картинки
  "./assets/1.1.png", "./assets/1.2.png", "./assets/1.3.png",
  "./assets/2.1.png", "./assets/2.2.png", "./assets/2.3.png",
  "./assets/3.1.png", "./assets/3.2.png", "./assets/3.3.png",
  "./assets/4.1.png", "./assets/4.2.png", "./assets/4.3.png",
  "./assets/5.1.png", "./assets/5.2.png", "./assets/5.3.png",
  "./assets/6.1.png", "./assets/6.2.png", "./assets/6.3.png",
  "./assets/7.1.png", "./assets/7.2.png", "./assets/7.3.png"
];

// Установка: кэшируем все ассеты приложения.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Активация: очищаем старые кэши, сразу захватываем страницы.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Запросы: офлайн-фолбэк для навигации, иначе кэш-first.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Навигация: сначала сеть (свежая версия), при сбое — кэш.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Остальное: кэш-first, при промахе — сеть с сохранением в кэш.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
