import * as React from "react";
import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("inline-flex rounded-md border border-zinc-800 p-1", className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("rounded px-2 py-1 text-xs text-zinc-300", className)} {...props} />;
}

export function TabsContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />;
}
