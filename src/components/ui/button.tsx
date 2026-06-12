import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Botón shadcn/ui adaptado a la identidad de galería:
 * Barlow Condensed, mayúsculas, tracking ancho, esquinas rectas.
 */
const buttonVariants = cva(
  "btn-gallery inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ink text-cream border border-ink hover:bg-transparent hover:text-ink",
        outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-cream",
        ghost: "bg-transparent text-ink hover:text-mid",
        destructive:
          "bg-transparent text-mid border border-border hover:border-ink hover:text-ink",
      },
      size: {
        default: "px-8 py-3",
        sm: "px-4 py-2 text-[0.65rem]",
        lg: "px-11 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
