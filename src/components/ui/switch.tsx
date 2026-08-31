"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Material Design 3 Switch - 52×32px container
        "relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer rounded-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Unchecked state: var(--input) background with var(--outline) border, padding: 2px 8px
        "data-[state=unchecked]:bg-[var(--input)] data-[state=unchecked]:border-2 data-[state=unchecked]:border-[var(--outline)] data-[state=unchecked]:px-2 data-[state=unchecked]:py-0.5 data-[state=unchecked]:justify-start",
        // Checked state: var(--primary) background, no border, padding: 2px 4px, justify-end
        "data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-0 data-[state=checked]:px-1 data-[state=checked]:py-0.5 data-[state=checked]:justify-end",
        "items-center",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Material Design 3 Handle
          "pointer-events-none block rounded-full transition-all",
          // Unchecked state: 16×16px handle in var(--outline)
          "data-[state=unchecked]:h-4 data-[state=unchecked]:w-4",
          "data-[state=unchecked]:bg-[var(--outline)]",
          "data-[state=unchecked]:translate-x-0",
          // Checked state: 24×24px handle in white
          "data-[state=checked]:h-6 data-[state=checked]:w-6",
          "data-[state=checked]:bg-white",
          "data-[state=checked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
