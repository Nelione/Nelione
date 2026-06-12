import type * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full border-0 border-b border-border bg-transparent px-0 py-3 text-sm font-light text-ink placeholder:text-mid/60 transition-colors focus:border-ink focus:outline-none focus:ring-0 aria-[invalid=true]:border-red-700";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-32 resize-y", className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor llega vía props
    <label className={cn("text-eyebrow mb-1 block", className)} {...props} />
  );
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "appearance-none", className)} {...props} />;
}
