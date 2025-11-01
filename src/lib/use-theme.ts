import { use } from "react";
import { ThemeContext } from "@/components/theme-provider";

export function useTheme() {
  const val = use(ThemeContext);
  if (!val) throw new Error("useTheme called outside of ThemeProvider!");
  return val;
}
