import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const chipVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 label-large",
  {
    variants: {
      variant: {
        assist:
          "bg-surface text-foreground border border-border hover:bg-muted",

        filter:
          "bg-surface text-muted-foreground border border-border hover:bg-muted",

        suggestion:
          "bg-surface text-muted-foreground border border-border hover:bg-muted",

        input:
          "bg-surface text-muted-foreground border border-border hover:bg-muted",
      },

      selected: {
        true:
          "bg-secondary-container text-secondary-container-foreground border-secondary-container",

        false: "",
      },

      size: {
        default: "h-8 px-4 rounded-[8px]",
        sm: "h-7 px-3 rounded-[8px]",
      },
    },

    defaultVariants: {
      variant: "assist",
      selected: false,
      size: "default",
    },
  }
);

function Chip({
  className,
  variant,
  selected,
  size,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof chipVariants> & {
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  }) {
  return (
    <button
      className={cn(
        chipVariants({
          variant,
          selected,
          size,
        }),
        className
      )}
      {...props}
    >
      {leadingIcon}

      <span>{children}</span>

      {trailingIcon}
    </button>
  );
}

export { Chip, chipVariants };