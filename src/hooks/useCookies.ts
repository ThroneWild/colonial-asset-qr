import { useState, useCallback, useEffect } from 'react';
import {
  setCookie,
  getCookie,
  deleteCookie,
  setCookieJSON,
  getCookieJSON,
  type CookieOptions,
} from '@/utils/cookies';

/**
 * React hook for managing cookies with automatic re-rendering
 * Similar to useState but persists data in cookies
 */
export function useCookie(
  name: string,
  defaultValue: string = '',
  options?: CookieOptions
): [string, (value: string) => void, () => void] {
  const [value, setValue] = useState<string>(() => {
    const cookie = getCookie(name);
    return cookie !== null ? cookie : defaultValue;
  });

  const updateCookie = useCallback(
    (newValue: string) => {
      setCookie(name, newValue, options);
      setValue(newValue);
    },
    [name, options]
  );

  const removeCookie = useCallback(() => {
    deleteCookie(name, options);
    setValue(defaultValue);
  }, [name, defaultValue, options]);

  // Sync with cookie changes from other tabs/windows
  useEffect(() => {
    const interval = setInterval(() => {
      const currentCookie = getCookie(name);
      if (currentCookie !== null && currentCookie !== value) {
        setValue(currentCookie);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [name, value]);

  return [value, updateCookie, removeCookie];
}

/**
 * React hook for managing JSON cookies with type safety
 */
export function useCookieJSON<T>(
  name: string,
  defaultValue: T,
  options?: CookieOptions
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    const cookie = getCookieJSON<T>(name);
    return cookie !== null ? cookie : defaultValue;
  });

  const updateCookie = useCallback(
    (newValue: T) => {
      setCookieJSON(name, newValue, options);
      setValue(newValue);
    },
    [name, options]
  );

  const removeCookie = useCallback(() => {
    deleteCookie(name, options);
    setValue(defaultValue);
  }, [name, defaultValue, options]);

  // Sync with cookie changes from other tabs/windows
  useEffect(() => {
    const interval = setInterval(() => {
      const currentCookie = getCookieJSON<T>(name);
      if (currentCookie !== null && JSON.stringify(currentCookie) !== JSON.stringify(value)) {
        setValue(currentCookie);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [name, value]);

  return [value, updateCookie, removeCookie];
}

/**
 * Hook to manage user preferences via cookies
 */
export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useCookieJSON<{
    sidebarCollapsed?: boolean;
    defaultView?: 'grid' | 'list';
    itemsPerPage?: number;
    showOnboarding?: boolean;
    notifications?: boolean;
  }>('colonial_user_prefs', {}, { expires: 365 });

  const updatePreference = useCallback(
    <K extends keyof typeof preferences>(key: K, value: (typeof preferences)[K]) => {
      setPreferences({ ...preferences, [key]: value });
    },
    [preferences, setPreferences]
  );

  return {
    preferences,
    setPreferences,
    updatePreference,
    removePreferences,
  };
}

/**
 * Hook to track auto-update consent
 */
export function useAutoUpdateConsent() {
  const [consent, setConsent] = useCookie('colonial_auto_update', 'false', {
    expires: 365,
  });

  const hasConsent = consent === 'true';

  const giveConsent = useCallback(() => {
    setConsent('true');
  }, [setConsent]);

  const revokeConsent = useCallback(() => {
    setConsent('false');
  }, [setConsent]);

  return {
    hasConsent,
    giveConsent,
    revokeConsent,
  };
}

/**
 * Hook to remember last visited page
 */
export function useLastVisited() {
  const [lastVisited, setLastVisited] = useCookie('colonial_last_visited', '/', {
    expires: 7,
  });

  return {
    lastVisited,
    setLastVisited,
  };
}
