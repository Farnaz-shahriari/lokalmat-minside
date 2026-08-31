/* Material Symbols Outlined wrapper.
   FILL 0 at rest, FILL 1 for selected/active states, per the design handoff.
   24px default, 20px in dense rows, 44px in empty states. No emoji, ever. */

import { cn } from "./ui/utils";

interface IconProps {
  name: string;
  /** px. The handoff's sizes are 15-24 inline, 28 on tiles, 44 in empty states. */
  size?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 24, fill = false, className, style }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      data-fill={fill ? "1" : "0"}
      aria-hidden="true"
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}
