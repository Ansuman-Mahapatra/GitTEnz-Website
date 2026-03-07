// Self-destructing service worker - unregisters itself immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  // Unregister this service worker entirely so it stops intercepting requests
  await self.registration.unregister();
  // Tell all open clients to reload so they get clean resources
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.navigate(client.url));
});
