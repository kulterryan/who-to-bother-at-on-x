import { Monitor, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { T as Theme } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      className="inline-flex"
      onValueChange={(value) => {
        if (value) {
          setTheme(value as Theme);
        }
      }}
      type="single"
      value={theme}
    >
      <ToggleGroupItem aria-label="Light mode" value="light">
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Dark mode" value="dark">
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="System theme" value="system">
        <Monitor className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
