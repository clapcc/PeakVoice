import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[transform,background-color,box-shadow,opacity,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_24px_rgba(0,0,0,0.28)] hover:bg-accent/90",
        glass:
          "bg-glass text-fg shadow-[var(--shadow-border)] hover:bg-glass-strong",
        ghost: "bg-transparent text-fg-muted hover:bg-glass hover:text-fg",
        danger: "bg-danger text-accent-fg hover:bg-danger/90",
      },
      size: {
        sm: "h-10 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
