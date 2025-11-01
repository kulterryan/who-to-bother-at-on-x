import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <button 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      className="fixed bottom-8 right-8 rounded-full border-2 border-zinc-200 bg-white p-3 text-zinc-900 shadow-lg transition-all hover:border-zinc-900 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500"
    >
      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}