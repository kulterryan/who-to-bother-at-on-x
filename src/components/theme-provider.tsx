import { createContext, type PropsWithChildren, useEffect, useState } from "react";
import { getStoredTheme, setStoredTheme, type T as Theme } from "@/lib/theme";

export type ThemeContextVal = { 
  theme: Theme; 
  setTheme: (val: Theme) => void;
  resolvedTheme: "light" | "dark";
};
type Props = PropsWithChildren<{ theme: Theme }>;

export const ThemeContext = createContext<ThemeContextVal | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: Omit<Props, 'theme'>) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    // Initialize system theme based on current system preference
    return getSystemTheme();
  });
  
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  function setTheme(val: Theme) {
    setThemeState(val);
    setStoredTheme(val);
  }

  // Sync theme to HTML element when resolved theme changes
  useEffect(() => {
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);

  // Update system theme on mount to ensure it's current
  useEffect(() => {
    setSystemTheme(getSystemTheme());
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Always listen for system theme changes, even when not in system mode
    // This ensures we have the correct value when switching to system mode
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

