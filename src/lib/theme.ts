export type T = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme-preference";

export function getStoredTheme(): T {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage might be blocked
  }

  return "system";
}

export function setStoredTheme(theme: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage might be blocked
  }
}
