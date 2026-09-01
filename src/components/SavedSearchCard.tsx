/* SavedSearchCard — the notification cards in Min side's first section.

   Only saved searches with count > 0 ever reach this component; the section
   renders nothing when there are none.

   Like ProducerMini, this uses ListItem for the text stack but places the count
   badge outside its leading slot — ListItem's leading box is a fixed 24px and
   this badge is a 44px circle. See the ProducerMini header for the full note. */

import { ListItem } from "./ui/list-item";
import { Icon } from "./Icon";
import { hitLabel } from "../lib/format";
import type { SavedSearch } from "../data/lokalmat-data";

export function SavedSearchCard({
  search,
  onOpen,
}: {
  search: SavedSearch;
  onOpen: () => void;
}) {
  return (
    <div
      className="flex items-center w-full bg-surface border border-outline-variant cursor-pointer transition-colors hover:bg-surface-container-low"
      style={{
        borderRadius: "var(--radius-card)",
        gap: "var(--space-sm)",
        padding: "var(--space-sm)",
        transitionTimingFunction: "var(--motion-standard)",
        transitionDuration: "150ms",
      }}
      onClick={onOpen}
    >
      {/* 44px count badge, primary-container */}
      <div className="shrink-0 w-11 h-11 rounded-full bg-primary-container flex items-center justify-center">
        <span className="title-medium text-primary-container-foreground">
          {search.count}
        </span>
      </div>

      <ListItem
        density="compact"
        /* The overline here is uppercase and --primary, where ListItem defaults to
           muted-foreground. Overridden as an arbitrary variant on the first child
           <p> rather than forking the component. */
        className="flex-1 min-w-0 px-0 hover:bg-transparent pointer-events-none [&>div>p:first-child]:uppercase [&>div>p:first-child]:tracking-[0.5px] [&>div>p:first-child]:text-primary"
        overline={hitLabel(search.count)}
        title={search.name}
      />

      <Icon name="chevron_right" size={22} className="shrink-0 text-on-surface-variant" />
    </div>
  );
}
