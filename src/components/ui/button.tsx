import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 label-medium",
  {
    variants: {
      variant: {
        // Primary/Filled - main action button
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // Secondary/Outlined - alternative action button
        secondary: "border border-border text-foreground hover:bg-muted",
        
        // Tertiary/Text - least important action
        tertiary: "text-primary hover:bg-muted",
        
        // Destructive - for delete/destructive actions
        destructive: "bg-error text-error-foreground hover:bg-error/90",
        
        // Ghost - for subtle actions
        ghost: "hover:bg-muted",
      },
      size: {
        // Default medium - 56px height (standard for all buttons)
        default: "h-14 px-6 py-3.5 rounded-[var(--radius-button)]",
        
        // Small - for text/tertiary buttons in compact contexts (40px height)
        sm: "h-10 px-4 py-2 rounded-[var(--radius-button)]",
        
        // Icon button - 56px square
        icon: "w-14 h-14 rounded-full",
        
        // Small icon button - for compact UIs (48px)
        "icon-sm": "w-12 h-12 rounded-full",
        
        // Tiny icon button - for very compact UIs (40px) - use sparingly
        "icon-xs": "w-10 h-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };