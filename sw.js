// Offline cache. Bump VERSION whenever any file changes so phones pick it up.
const VERSION = 'audio-9';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'camera.js', 'library.json', 'manifest.webmanifest',
  'audio/sprite.m4a', 'audio/sprite.json', 'audio/keepawake.mp4',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Safari fetches media with Range headers and refuses a plain 200 for them,
// so slice the cached file into a 206 response.
async function rangeResponse(req) {
  const cached = await caches.match(req.url, { ignoreSearch: true });
  if (!cached) return fetch(req);
  const buf = await cached.arrayBuffer(), len = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  let start = 0, end = len - 1;
  if (m && m[1] === '' && m[2]) start = Math.max(0, len - +m[2]);
  else if (m) { start = +m[1] || 0; if (m[2]) end = Math.min(+m[2], len - 1); }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'audio/mp4',
      'Content-Range': `bytes ${start}-${end}/${len}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.headers.has('range')) { e.respondWith(rangeResponse(req)); return; }
  // Camera-coach files (~15 MB) are not precached; they are cached the first time the camera is used.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok && new URL(req.url).pathname.includes('/vendor/')) {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
    }
    return res;
  })));
});
