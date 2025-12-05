import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { T as Theme } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
} as const;

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

export function MobileThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const CurrentIcon = themeIcons[theme];

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        aria-label={`Theme: ${themeLabels[theme]}`}
        className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <CurrentIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        sideOffset={8}
      >
        <div className="flex flex-col gap-0.5">
          {(["light", "dark", "system"] as const).map((themeOption) => {
            const Icon = themeIcons[themeOption];
            const isActive = theme === themeOption;
            return (
              <button
                aria-label={themeLabels[themeOption]}
                className={`rounded-md p-2 transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                }`}
                key={themeOption}
                onClick={() => handleSelect(themeOption)}
                type="button"
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
