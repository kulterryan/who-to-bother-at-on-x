import { useRouter } from "@tanstack/react-router";
import { createContext, type PropsWithChildren, useEffect, useState } from "react";
import { setThemeServerFn, type T as Theme } from "@/lib/theme";

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

function getInitialSystemTheme(): "light" | "dark" {
  // On initial mount, read from the already-set className to avoid flash
  if (typeof window === "undefined") return "light";
  const currentClass = document.documentElement.className;
  if (currentClass === "dark" || currentClass === "light") {
    return currentClass;
  }
  return getSystemTheme();
}

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getInitialSystemTheme);
  
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  function setTheme(val: Theme) {
    // Save to server and invalidate router
    setThemeServerFn({ data: val }).then(() => router.invalidate());
  }

  // Sync theme to HTML element when resolved theme changes
  useEffect(() => {
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    // Re-check system theme when switching to system mode
    setSystemTheme(getSystemTheme());

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

