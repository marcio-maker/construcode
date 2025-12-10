// sw.js - ATUALIZADO
const CACHE_NAME = 'construcode-v3';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/index.html',
        '/servicos.html',
        '/portfolio.html',
        '/blog.html',
        '/sobre.html',
        '/contato.html',
        '/legal.html',
        '/login.html',
        
        // ADICIONE AS PÁGINAS DENTRO DA PASTA PROJECTS:
        '/projects/project-1.html',
        '/projects/project-2.html',
        '/projects/project-3.html',
        '/projects/project-4.html',
        '/projects/project-5.html',
        '/projects/project-6.html',
        
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png'
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});