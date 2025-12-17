import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border-2 border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 transition-colors",
        "placeholder:text-zinc-500",
        "focus:border-orange-600 focus:outline-none focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400",
        "dark:focus:border-orange-600",
        className
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
