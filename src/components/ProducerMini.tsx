/* ProducerMini — the compact producer rows in the Min side map sidebar.

   The handoff maps this to the design system's ListItem at density="compact",
   which is "exactly what ListItem was built for", and that is what carries the
   text stack here: overline (region), title (name), supportingText (org.nr +
   categories), all ellipsised on overflow, at compact density.

   TWO DEVIATIONS, both forced by ListItem's current API — flagged rather than
   silently worked around:

   1. leadingIcon is NOT used. ListItem hard-codes its leading slot to a 24px
      box (`w-6 h-6`); this design needs a 52px category tile, which would
      overflow it. The tile therefore sits beside ListItem inside the same
      bordered row.
   2. trailingIcon is NOT used for the follow control. ListItem renders as a
      <button>, so nesting an interactive button in its trailing slot would
      produce a button inside a button — invalid HTML that breaks keyboard
      navigation. The follow icon button sits beside ListItem instead.

   Both are worth raising upstream: a leading slot that accepts a size, and a
   non-interactive ListItem variant, would let this row use the component
   wholesale. Logged in the README's design-system feedback section. */

import { ListItem } from "./ui/list-item";
import { Button } from "./ui/button";
import { Icon } from "./Icon";
import type { EnrichedProducer } from "../lib/enrich";
import { useApp } from "../state/AppState";

export function ProducerMini({
  producer,
  onOpen,
  onFollowToggle,
}: {
  producer: EnrichedProducer;
  onOpen?: () => void;
  /** Lets the parent list hold this row in place before it leaves. */
  onFollowToggle?: () => void;
}) {
  const { toggleFollow } = useApp();

  return (
    <div
      className="flex items-center w-full bg-surface border border-outline-variant"
      style={{
        borderRadius: "var(--radius-card)",
        gap: "var(--space-sm)",
        padding: "var(--space-sm)",
      }}
    >
      {/* 52px category tile. Placeholder for a real photo, see category-tints.ts */}
      <div
        className="shrink-0 w-[52px] h-[52px] flex items-center justify-center"
        style={{ background: producer.tint.color, borderRadius: "var(--radius-card)" }}
      >
        <Icon name={producer.tint.icon} size={28} style={{ color: producer.tint.ink, opacity: 0.6 }} />
      </div>

      <ListItem
        density="compact"
        /* ListItem styles its overline as `label-small text-muted-foreground`.
           This design needs it uppercase. Applied as an arbitrary variant on the
           first child <p> rather than forking the component — the size and weight
           stay ListItem's, only the transform is added. */
        className="flex-1 min-w-0 px-0 hover:bg-transparent [&>div>p:first-child]:uppercase [&>div>p:first-child]:tracking-[0.5px]"
        overline={producer.region}
        title={producer.name}
        supportingText={`${producer.orgNr} · ${producer.categoriesText}`}
        onClick={onOpen}
      />

      <Button
        variant={producer.followed ? "secondary" : "ghost"}
        size="icon-xs"
        className="shrink-0"
        aria-label={producer.followed ? `Slutt å følge ${producer.name}` : `Følg ${producer.name}`}
        aria-pressed={producer.followed}
        onClick={() => {
          onFollowToggle?.();
          toggleFollow(producer.id);
        }}
      >
        <Icon name={producer.followed ? "check" : "add"} size={20} />
      </Button>
    </div>
  );
}
