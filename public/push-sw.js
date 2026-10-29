/* eslint-disable no-restricted-globals */
// Service Worker: obsługa powiadomień Web Push dla czatu sąsiedzkiego mójMińsk.app

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Nowa wiadomość — mójMińsk',
    body: 'Sąsiad napisał do Ciebie w sprawie ogłoszenia.',
    url: '/wiadomosci',
    conversationId: null,
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: payload.conversationId ? `chat-${payload.conversationId}` : 'mojminsk-chat',
    renotify: true,
    data: {
      url: payload.url || '/wiadomosci',
      conversationId: payload.conversationId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/wiadomosci';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.postMessage({
              type: 'OPEN_CHAT_URL',
              url: targetUrl,
            });
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      }),
  );
});
