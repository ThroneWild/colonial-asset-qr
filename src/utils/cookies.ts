/**
 * Utility for managing cookies in the application
 * Works in both browser and Electron environments
 */

export interface CookieOptions {
  expires?: number | Date; // Days from now or specific date
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the given name, value and options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  try {
    const {
      expires,
      path = '/',
      domain,
      secure = window.location.protocol === 'https:',
      sameSite = 'lax',
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      const expiresDate =
        typeof expires === 'number'
          ? new Date(Date.now() + expires * 24 * 60 * 60 * 1000)
          : expires;
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }

    cookieString += `; path=${path}`;

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += '; secure';
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  try {
    const cookies: Record<string, string> = {};
    const cookieStrings = document.cookie.split(';');

    for (const cookie of cookieStrings) {
      const [name, ...valueParts] = cookie.split('=');
      if (name && valueParts.length > 0) {
        const trimmedName = name.trim();
        const value = valueParts.join('=').trim();
        cookies[decodeURIComponent(trimmedName)] = decodeURIComponent(value);
      }
    }

    return cookies;
  } catch (error) {
    console.error('Error getting all cookies:', error);
    return {};
  }
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Clear all cookies
 */
export function clearAllCookies(options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  try {
    const cookies = getAllCookies();
    for (const name in cookies) {
      deleteCookie(name, options);
    }
  } catch (error) {
    console.error('Error clearing all cookies:', error);
  }
}

/**
 * Store object as JSON in cookie
 */
export function setCookieJSON<T>(
  name: string,
  value: T,
  options?: CookieOptions
): void {
  try {
    const jsonString = JSON.stringify(value);
    setCookie(name, jsonString, options);
  } catch (error) {
    console.error('Error setting JSON cookie:', error);
  }
}

/**
 * Get object from JSON cookie
 */
export function getCookieJSON<T>(name: string): T | null {
  try {
    const value = getCookie(name);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error getting JSON cookie:', error);
    return null;
  }
}

// Predefined cookie names for the application
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'colonial_auth_token',
  REFRESH_TOKEN: 'colonial_refresh_token',
  USER_PREFERENCES: 'colonial_user_prefs',
  THEME: 'colonial_theme',
  LANGUAGE: 'colonial_language',
  LAST_VISITED: 'colonial_last_visited',
  FILTERS_STATE: 'colonial_filters_state',
  TABLE_SETTINGS: 'colonial_table_settings',
  AUTO_UPDATE_CONSENT: 'colonial_auto_update',
} as const;

// Type-safe cookie management for specific application cookies
export const AppCookies = {
  // User preferences
  getUserPreferences: () => getCookieJSON<{
    sidebarCollapsed?: boolean;
    defaultView?: string;
    itemsPerPage?: number;
  }>(COOKIE_NAMES.USER_PREFERENCES),

  setUserPreferences: (prefs: Record<string, any>) =>
    setCookieJSON(COOKIE_NAMES.USER_PREFERENCES, prefs, { expires: 365 }),

  // Theme
  getTheme: () => getCookie(COOKIE_NAMES.THEME),
  setTheme: (theme: 'light' | 'dark' | 'system') =>
    setCookie(COOKIE_NAMES.THEME, theme, { expires: 365 }),

  // Language
  getLanguage: () => getCookie(COOKIE_NAMES.LANGUAGE),
  setLanguage: (lang: string) =>
    setCookie(COOKIE_NAMES.LANGUAGE, lang, { expires: 365 }),

  // Last visited page
  getLastVisited: () => getCookie(COOKIE_NAMES.LAST_VISITED),
  setLastVisited: (path: string) =>
    setCookie(COOKIE_NAMES.LAST_VISITED, path, { expires: 7 }),

  // Auto-update consent
  getAutoUpdateConsent: () => getCookie(COOKIE_NAMES.AUTO_UPDATE_CONSENT) === 'true',
  setAutoUpdateConsent: (consent: boolean) =>
    setCookie(COOKIE_NAMES.AUTO_UPDATE_CONSENT, consent.toString(), { expires: 365 }),
};
