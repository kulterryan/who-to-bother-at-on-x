import type * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
	return (
		<label
			data-slot="label"
			className={cn(
				"text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100",
				"peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
