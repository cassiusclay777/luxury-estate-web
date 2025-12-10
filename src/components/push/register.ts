/**
 * =============================================================================
 * PUSH NOTIFICATION REGISTRATION
 * =============================================================================
 * Client-side utilities for:
 * - Service worker registration
 * - Push subscription management
 * - VAPID key handling
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

// =============================================================================
// TYPES
// =============================================================================

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushRegistrationResult {
  success: boolean;
  subscription?: PushSubscriptionData;
  error?: string;
}

// =============================================================================
// VAPID KEY CONVERSION
// =============================================================================

/**
 * Convert base64 VAPID key to Uint8Array for subscription
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray as BufferSource;
}

// =============================================================================
// SERVICE WORKER REGISTRATION
// =============================================================================

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[Push] Service worker registered:', registration.scope);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('[Push] Service worker registration failed:', error);
    return null;
  }
}

// =============================================================================
// PUSH SUBSCRIPTION
// =============================================================================

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'PushManager' in window && 'serviceWorker' in navigator;
}

/**
 * Check current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[Push] Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[Push] Notification permission:', permission);
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushRegistrationResult> {
  // Check support
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  // Request permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return { success: false, error: 'Notification permission denied' };
  }

  // Register service worker
  const registration = await registerServiceWorker();
  if (!registration) {
    return { success: false, error: 'Service worker registration failed' };
  }

  try {
    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn('[Push] VAPID public key not configured');
      return { success: false, error: 'VAPID key not configured' };
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[Push] Subscribed:', subscription.endpoint);

    // Extract subscription data
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };

    // Send subscription to server
    await saveSubscription(subscriptionData);

    return { success: true, subscription: subscriptionData };
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from server
      await removeSubscription(subscription.endpoint);
      
      console.log('[Push] Unsubscribed');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Check if currently subscribed
 */
export async function checkIsSubscribed(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

// =============================================================================
// SERVER COMMUNICATION
// =============================================================================

/**
 * Save subscription to server
 */
async function saveSubscription(subscription: PushSubscriptionData): Promise<void> {
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to save subscription');
  }
}

/**
 * Remove subscription from server
 */
async function removeSubscription(endpoint: string): Promise<void> {
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
}

// =============================================================================
// HELPERS
// =============================================================================

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setIsSupported(isPushSupported());
      setPermission(getNotificationPermission());
      setIsSubscribedState(await checkIsSubscribed());
      setIsLoading(false);
    };

    init();
  }, []);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    const result = await subscribeToPush();
    setIsSubscribedState(result.success);
    setPermission(getNotificationPermission());
    setIsLoading(false);
    return result;
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    const success = await unsubscribeFromPush();
    if (success) setIsSubscribedState(false);
    setIsLoading(false);
    return success;
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
