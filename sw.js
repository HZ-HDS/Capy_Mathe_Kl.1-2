/* Service Worker: speichert die Seite für die Offline-Nutzung auf dem iPad.
   Nach Änderungen an Dateien die Versionsnummer erhöhen. */
const CACHE = 'capy-mathe-v1';
const FILES = [
  './', 'index.html', 'manifest.json', 'css/style.css',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/data/phrases.js', 'js/data/stories.js', 'js/data/rewards-data.js', 'js/data/parents-data.js',
  'js/core/util.js', 'js/core/storage.js', 'js/core/sound.js', 'js/core/capy.js', 'js/core/visuals.js', 'js/core/pdf.js',
  'js/core/coach.js', 'js/core/engine.js',
  'js/exercises/common.js', 'js/exercises/world1.js', 'js/exercises/world2.js', 'js/exercises/world3.js',
  'js/screens/intro.js', 'js/screens/map.js', 'js/screens/rewards.js', 'js/screens/parents.js', 'js/app.js'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Erst Netz (für Updates), bei Offline aus dem Speicher
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
