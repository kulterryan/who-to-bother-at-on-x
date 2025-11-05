import { use } from "react";
import { ThemeContext, type ThemeContextVal } from "@/components/theme-provider";

export function useTheme(): ThemeContextVal {
  const val = use(ThemeContext);
  if (!val) { throw new Error("useTheme called outside of ThemeProvider!"); }
  return val;
}
