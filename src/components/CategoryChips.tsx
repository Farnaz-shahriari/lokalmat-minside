/* Multi-select category filter chips. Uses the design system's Chip with
   variant="filter"; selected state is secondary-container, per the handoff. */

import { Chip } from "./ui/chip";

export function CategoryChips({
  categories,
  selected,
  onToggle,
}: {
  categories: string[];
  selected: string[];
  onToggle: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap" style={{ gap: "var(--space-sm)" }}>
      {categories.map((c) => (
        <Chip
          key={c}
          variant="filter"
          selected={selected.includes(c)}
          onClick={() => onToggle(c)}
        >
          {c}
        </Chip>
      ))}
    </div>
  );
}
