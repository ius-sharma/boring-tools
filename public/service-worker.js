// Simplified service worker - mainly for background notifications
// Timer is now managed in the React component using wall-clock time

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Timer notification',
    icon: '/favicon.ico',
  };
  event.waitUntil(self.registration.showNotification('Pomodoro Timer', options));
});
