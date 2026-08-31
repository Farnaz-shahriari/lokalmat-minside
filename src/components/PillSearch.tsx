/* The pill search field. Two sizes in this design:
     - Min side search box: height-lg (56px), max 720px
     - Søk sidebar:         the handoff picks height-lg here too ("it reads
                            better next to the map")

   surface-container background, radius-button, leading search icon. Built as a
   plain input rather than the design system's `input`, because `input.tsx` is
   an outlined 36px field — a different component with a different anatomy.
   The outlined variant IS used elsewhere; see SearchField below. */

import { Icon } from "./Icon";
import { cn } from "./ui/utils";

export function PillSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
  className,
  iconSize = 24,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      className={cn("flex items-center bg-surface-container", className)}
      style={{
        height: "var(--height-lg)",
        gap: "12px",
        paddingInline: "var(--space-lg) var(--space-sm)",
        borderRadius: "var(--radius-button)",
      }}
    >
      <Icon name="search" size={iconSize} className="text-on-surface-variant shrink-0" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.();
        }}
        className="flex-1 min-w-0 border-0 outline-none bg-transparent body-large text-on-surface placeholder:text-outline"
      />
    </div>
  );
}
