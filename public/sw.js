self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', () => {
  self.clients.claim()
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? JSON.parse(event.data.text()) : {}
  } catch (_e) { void 0 }
  const title = data.title || '通知'
  const body = data.body || '新しいお知らせがあります'
  const options = {
    body
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
})
