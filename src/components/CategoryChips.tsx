/* Multi-select category filter chips. Uses the design system's Chip with
   variant="filter"; selected state is secondary-container, per the handoff.

   Callers pass only the categories that can actually return something — see the
   `availableCategories` facet in the screens. Offering a filter that can only
   ever produce an empty state is a dead end for the user. When nothing is left
   to offer, the whole row renders nothing rather than an empty gap. */

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
  if (!categories.length) return null;

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
