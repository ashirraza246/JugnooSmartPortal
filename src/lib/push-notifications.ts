// Push Notification Utility for Jugnoo Smart Portal
// Handles browser notification permission, service worker push, and local fallbacks

// Mock VAPID key for push subscription (would be replaced with real key in production)
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkOs-GV3W7F4jkoR1vN3A3LMPh2Qh5qN1h0MDsN0LE';

// localStorage key for notification preferences
const NOTIFICATION_PREFS_KEY = 'jugnoo_notification_prefs';

export interface NotificationPreferences {
  enabled: boolean;
  statusChanges: boolean;
  payments: boolean;
  deadlines: boolean;
  info: boolean;
}

export const defaultPreferences: NotificationPreferences = {
  enabled: true,
  statusChanges: true,
  payments: true,
  deadlines: true,
  info: true,
};

/**
 * Check if the Notification API is available in this browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get the current notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * Returns the permission state after request
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';

  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Convert VAPID key from base64 to Uint8Array for push subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Subscribe to push notifications via the service worker
 * Returns the push subscription or null if failed
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isServiceWorkerSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    // In production, you would send the subscription to your backend here
    console.log('Push subscription created:', subscription.endpoint);
    return subscription;
  } catch (error) {
    console.warn('Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Push unsubscription failed:', error);
    return false;
  }
}

/**
 * Show a local notification via the service worker
 * This works even when the tab is in the background (but app must be open)
 */
export async function showLocalNotification(
  title: string,
  body: string,
  options?: {
    url?: string;
    type?: string;
    tag?: string;
    actions?: Array<{ action: string; title: string; icon?: string }>;
  }
): Promise<boolean> {
  // Check preferences
  const prefs = getNotificationPreferences();
  if (!prefs.enabled) return false;

  // Check if this notification type is enabled
  const notifType = options?.type || 'info';
  if (notifType === 'status' && !prefs.statusChanges) return false;
  if (notifType === 'payment' && !prefs.payments) return false;
  if (notifType === 'deadline' && !prefs.deadlines) return false;
  if (notifType === 'info' && !prefs.info) return false;

  if (!isServiceWorkerSupported()) {
    // Fallback to basic Notification API
    return showFallbackNotification(title, body, options);
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const notifOptions: NotificationOptions = {
      body,
      icon: '/icon-192.png',
      tag: options?.tag || 'jugnoo-notification',
      data: {
        url: options?.url || '/',
        type: notifType,
      },
    };
    await registration.showNotification(title, notifOptions);
    return true;
  } catch (error) {
    console.warn('Service worker notification failed, falling back:', error);
    return showFallbackNotification(title, body, options);
  }
}

/**
 * Fallback: show notification using the basic Notification API
 * This only works when the app is in the foreground
 */
function showFallbackNotification(
  title: string,
  body: string,
  options?: {
    url?: string;
    type?: string;
    tag?: string;
  }
): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: options?.tag || 'jugnoo-notification',
    });

    notification.onclick = () => {
      window.focus();
      const url = options?.url || '/';
      if (url !== '/' && url !== window.location.pathname) {
        window.location.href = url;
      }
      notification.close();
    };

    return true;
  } catch {
    return false;
  }
}

/**
 * Save notification preferences to localStorage
 */
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage not available
  }
}

/**
 * Get notification preferences from localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultPreferences;
  try {
    const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch {
    // localStorage not available
  }
  return defaultPreferences;
}

/**
 * Initialize push notifications - request permission and subscribe
 * Call this on app load or when user enables notifications
 */
export async function initializePushNotifications(): Promise<{
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}> {
  const permission = await requestNotificationPermission();
  let subscription: PushSubscription | null = null;

  if (permission === 'granted') {
    subscription = await subscribeToPush();
  }

  return { permission, subscription };
}

/**
 * Check if push notifications are fully set up and working
 */
export async function isPushNotificationReady(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (!isServiceWorkerSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
