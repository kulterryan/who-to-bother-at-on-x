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

export function MobileThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);

	const CurrentIcon = themeIcons[theme];

	const handleSelect = (newTheme: Theme) => {
		setTheme(newTheme);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
				aria-label={`Theme: ${themeLabels[theme]}`}
			>
				<CurrentIcon className="size-4" />
			</PopoverTrigger>
			<PopoverContent
				className="w-auto border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
				align="end"
				sideOffset={8}
			>
				<div className="flex flex-col gap-0.5">
					{(["light", "dark", "system"] as const).map((themeOption) => {
						const Icon = themeIcons[themeOption];
						const isActive = theme === themeOption;
						return (
							<button
								key={themeOption}
								onClick={() => handleSelect(themeOption)}
								className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
									isActive
										? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
										: "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
								}`}
							>
								<Icon className="size-4" />
								<span>{themeLabels[themeOption]}</span>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
