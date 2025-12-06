/**
 * =============================================================================
 * PUSH NOTIFICATION SERVICE WORKER
 * =============================================================================
 * Handles Web Push notifications for:
 * - Price drop alerts
 * - New property notifications
 * - Saved search updates
 * 
 * Place in: public/sw.js
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// =============================================================================
// INSTALL & ACTIVATE
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service worker activated');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// =============================================================================
// PUSH EVENT HANDLER
// =============================================================================

interface PushPayload {
  type: 'price_drop' | 'new_property' | 'saved_search';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: {
    propertyId?: string;
    url?: string;
    priceChange?: number;
    oldPrice?: number;
    newPrice?: number;
  };
}

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (!event.data) {
    console.warn('[SW] Push event has no data');
    return;
  }

  try {
    const payload: PushPayload = event.data.json();
    console.log('[SW] Push payload:', payload);

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      image: payload.image,
      data: payload.data,
      tag: payload.data?.propertyId || 'luxestate-notification',
      renotify: true,
      requireInteraction: payload.type === 'price_drop', // Keep price drops visible
      actions: getNotificationActions(payload.type),
      vibrate: [200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  } catch (error) {
    console.error('[SW] Error processing push:', error);
  }
});

function getNotificationActions(type: string): NotificationAction[] {
  switch (type) {
    case 'price_drop':
      return [
        { action: 'view', title: '👀 Zobrazit' },
        { action: 'dismiss', title: '❌ Zavřít' },
      ];
    case 'new_property':
      return [
        { action: 'view', title: '🏠 Zobrazit' },
        { action: 'save', title: '❤️ Uložit' },
      ];
    default:
      return [
        { action: 'view', title: 'Zobrazit' },
      ];
  }
}

// =============================================================================
// NOTIFICATION CLICK HANDLER
// =============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (event.action === 'view' && data?.url) {
    url = data.url;
  } else if (data?.propertyId) {
    url = `/properties/${data.propertyId}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// =============================================================================
// NOTIFICATION CLOSE HANDLER (for analytics)
// =============================================================================

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // Track dismissal (optional analytics)
  const data = event.notification.data;
  if (data?.propertyId) {
    // Could send analytics event here
  }
});

// Export for TypeScript
export {};
