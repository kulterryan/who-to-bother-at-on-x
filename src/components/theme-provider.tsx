import { useRouter } from "@tanstack/react-router";
import { createContext, type PropsWithChildren, use, useEffect } from "react";
import { setThemeServerFn, type T as Theme } from "@/lib/theme";

type ThemeContextVal = { theme: Theme; setTheme: (val: Theme) => void };
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

export function ThemeProvider({ children, theme }: Props) {
  const router = useRouter();

  function setTheme(val: Theme) {
    // Update the HTML element className immediately
    document.documentElement.className = val;
    // Save to server and invalidate router
    setThemeServerFn({ data: val }).then(() => router.invalidate());
  }

  // Sync theme to HTML element on mount and when theme changes
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error("useTheme called outside of ThemeProvider!");
  return val;
}
