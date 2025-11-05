"use client";

import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: React.ComponentProps<typeof Root>) {
  return (
    <Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof Image>) {
  return (
    <Image
      className={cn("aspect-square size-full", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof Fallback>) {
  return (
    <Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted",
        className
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
