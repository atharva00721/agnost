import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}
