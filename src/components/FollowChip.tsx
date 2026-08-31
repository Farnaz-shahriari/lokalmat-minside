/* The follow toggle: "Følg" / "Følger".

   This is a CHIP, not a button — deliberate, and called out in the handoff's
   component mapping. Following is a persistent selected state, not a one-shot
   action, so it uses the chip's selected semantics with a leading icon that
   changes add -> check. Do not "fix" this into a Button. */

import { Chip } from "./ui/chip";
import { Icon } from "./Icon";

export function FollowChip({
  followed,
  onToggle,
}: {
  followed: boolean;
  onToggle: () => void;
}) {
  return (
    <Chip
      variant="filter"
      selected={followed}
      aria-pressed={followed}
      leadingIcon={<Icon name={followed ? "check" : "add"} size={18} />}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {followed ? "Følger" : "Følg"}
    </Chip>
  );
}
