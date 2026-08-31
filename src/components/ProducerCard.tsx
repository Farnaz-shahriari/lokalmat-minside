/* ProducerCard — full width, horizontal, ~188px tall.

   One of only three places serif is allowed: the producer name. See
   src/styles/fonts.css before adding a fourth. */

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Icon } from "./Icon";
import { FollowChip } from "./FollowChip";
import type { EnrichedProducer } from "../lib/enrich";
import { useApp } from "../state/AppState";

export function ProducerCard({
  producer,
  onView,
  onFollowToggle,
}: {
  producer: EnrichedProducer;
  onView?: () => void;
  /** Lets a parent list hold this card in place before it leaves. */
  onFollowToggle?: () => void;
}) {
  const { toggleFollow } = useApp();

  return (
    <Card
      className="relative flex items-stretch w-full gap-0 border-outline-variant"
      style={{ padding: "var(--space-lg)", borderRadius: "var(--radius-card)" }}
    >
      <div className="flex items-stretch w-full" style={{ gap: "var(--space-lg)" }}>
        {/* Media tile. The prototype's 20px radius rounds to radius-card (12px)
            per the handoff's radius table. Placeholder for a real photo. */}
        <div
          className="relative shrink-0 w-[148px] h-[148px] flex items-center justify-center overflow-hidden"
          style={{ background: producer.tint.color, borderRadius: "var(--radius-card)" }}
        >
          <Icon name={producer.tint.icon} size={60} style={{ color: producer.tint.ink, opacity: 0.5 }} />
          <span
            className="absolute inline-flex items-center label-xsmall"
            style={{ left: 10, bottom: 8, gap: 3, color: producer.tint.ink, opacity: 0.85, fontWeight: 700 }}
          >
            <Icon name="distance" size={14} />
            {producer.distance} km
          </span>
        </div>

        {/* Middle */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "var(--space-xs)" }}>
          <span className="inline-flex items-center label-small overline text-on-surface-variant" style={{ gap: "var(--space-xs)", fontWeight: 700 }}>
            <Icon name="location_on" size={15} />
            {producer.region}
          </span>

          {/* SERIF, 24px. One of the three sanctioned serif usages. */}
          <span className="font-brand-serif text-on-surface" style={{ fontSize: "var(--text-xl)", lineHeight: "30px" }}>
            {producer.name}
          </span>

          <div className="flex flex-wrap items-center" style={{ gap: "var(--space-sm)", marginBlock: 2 }}>
            <span className="inline-flex items-center label-small text-on-surface-variant whitespace-nowrap" style={{ gap: "var(--space-xs)", fontWeight: "var(--font-weight-semibold)" }}>
              <Icon name="badge" size={16} />
              {producer.orgNr}
            </span>
            {producer.categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center h-7 bg-secondary-container text-secondary-container-foreground label-small"
                style={{ paddingInline: 12, borderRadius: "var(--radius-button)", fontWeight: "var(--font-weight-semibold)" }}
              >
                {c}
              </span>
            ))}
          </div>

          <span className="body-medium text-on-surface-variant line-clamp-2">{producer.blurb}</span>
        </div>

        {/* Right */}
        <div className="shrink-0 flex flex-col items-end justify-between" style={{ gap: "var(--space-sm)" }}>
          <span className="inline-flex items-center label-small text-on-surface-variant" style={{ gap: "var(--space-xs)" }}>
            <Icon name="inventory_2" size={17} />
            {producer.productCount} produkter
          </span>
          <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
            <Button variant="tertiary" size="sm" onClick={onView}>
              Se produsent
              <Icon name="arrow_forward" size={18} />
            </Button>
            <FollowChip
              followed={producer.followed}
              onToggle={() => {
                onFollowToggle?.();
                toggleFollow(producer.id);
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
