import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { T as Theme } from "@/lib/theme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup 
      type="single" 
      value={theme} 
      onValueChange={(value) => {
        if (value) setTheme(value as Theme);
      }}
      className="inline-flex"
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System theme">
        <Monitor className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}