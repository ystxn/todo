self.addEventListener('install', () => {});

self.addEventListener('fetch', (e) => {
  fetch(e.request);
});
