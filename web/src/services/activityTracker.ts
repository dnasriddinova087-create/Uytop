import { api } from './api';

/**
 * Detect user device type, browser, OS, and screen resolution.
 */
export function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Noma\'lum qurilma';

  const ua = navigator.userAgent;
  let deviceType = 'Kompyuter (Desktop)';
  let os = 'Noma\'lum OS';
  let browser = 'Brauzer';

  // Device detection
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(iPad|Tablet|(Android(?!.*Mobile)))/i.test(ua);

  if (isTablet) {
    deviceType = 'Planshet (Tablet)';
  } else if (isMobile) {
    deviceType = 'Mobil telefon (Mobile)';
  }

  // OS detection
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser detection
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  const screenRes = `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`;

  return `${deviceType} • ${os} (${browser}) • ${screenRes}`;
}

/**
 * Record a user action immediately. Persists until deleted by an admin.
 */
export async function trackUserActivity(
  action: string,
  entityType: string = 'general',
  entityId?: number,
  details?: any
): Promise<void> {
  try {
    const userJson = localStorage.getItem('uytop_user');
    const token = localStorage.getItem('uytop_token');
    
    // Only track registered / authenticated users
    if (!token && !userJson) return;

    const deviceInfo = getDeviceInfo();
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : (details || '');

    // Send to backend API immediately
    await api.recordActivity({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: detailsStr,
      device_info: deviceInfo,
    });
  } catch (err) {
    // Non-blocking for the UI, logged silently
    console.warn('Activity track warn:', err);
  }
}
