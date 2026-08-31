/* ProductCard — 320px wide in scroll rows, fluid in the results grid, 420px tall.

   Fixed height is load-bearing: the Leveringsmuligheter block is hidden with
   `visibility: hidden` rather than removed when a product has neither delivery
   option, so cards in a row stay the same height. Do not switch it to `display:
   none`.

   Border, not shadow — the design system uses 1px borders for all structural
   separation. There are no drop shadows anywhere in this design. */

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Icon } from "./Icon";
import { FollowChip } from "./FollowChip";
import type { EnrichedProduct } from "../lib/enrich";
import { useApp } from "../state/AppState";

/** At most ONE status badge shows, in this priority order. */
function statusBadge(p: EnrichedProduct) {
  if (p.inSeason) return { icon: "auto_awesome", label: "Nå i sesong" };
  if (p.isNew) return { icon: "new_releases", label: "Nyhet" };
  if (p.isUpdated) return { icon: "update", label: "Oppdatert" };
  return null;
}

function DeliveryPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      className="inline-flex items-center h-[26px] border border-outline-variant text-on-surface label-small"
      style={{
        gap: "var(--space-xs)",
        paddingInline: "var(--space-sm)",
        borderRadius: "var(--radius-button)",
      }}
    >
      <Icon name={icon} size={15} className="text-on-surface-variant" />
      {label}
    </span>
  );
}

export function ProductCard({
  product,
  onFollowToggle,
  onSaveToggle,
}: {
  product: EnrichedProduct;
  /** Lets a parent list hold this card in place before it leaves. */
  onFollowToggle?: () => void;
  onSaveToggle?: () => void;
}) {
  const { toggleFollow, toggleSave } = useApp();
  const badge = statusBadge(product);

  return (
    <Card
      className="relative flex flex-col w-full h-[420px] gap-0 overflow-visible min-w-0 max-w-full border-outline-variant"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {/* Header: producer, county, follow chip */}
      <div className="flex items-start" style={{ gap: "var(--space-sm)", padding: "var(--space-md) var(--space-sm) var(--space-sm) var(--space-md)" }}>
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "var(--space-xs)" }}>
          <span className="body-large text-on-surface truncate" title={product.producer}>
            {product.producer}
          </span>
          <span className="inline-flex items-center body-medium text-on-surface-variant" style={{ gap: "var(--space-xs)" }}>
            <Icon name="location_on" size={18} fill className="text-primary" />
            {product.county}
          </span>
        </div>
        <div className="shrink-0">
          <FollowChip
            followed={product.producerFollowed}
            onToggle={() => {
              onFollowToggle?.();
              toggleFollow(product.producerId);
            }}
          />
        </div>
      </div>

      {/* Media. Placeholder for a real product photo — see category-tints.ts. */}
      <div
        className="relative h-[150px] flex items-center justify-center overflow-hidden shrink-0"
        style={{ background: product.tint.color }}
      >
        <Icon name={product.tint.icon} size={64} style={{ color: product.tint.ink, opacity: 0.45 }} />
      </div>

      {/* Body */}
      <div
        className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden"
        style={{ padding: "12px var(--space-md) var(--space-sm)", gap: "var(--space-sm)" }}
      >
        <span className="label-xsmall lm-overline text-on-surface-variant">{product.category}</span>

        <span className="title-medium text-on-surface truncate block" title={product.name}>
          {product.name}
        </span>

        {/* EPD number + at most one status badge, one line, min 18px */}
        <div className="flex items-center min-h-[18px] flex-nowrap overflow-hidden" style={{ gap: "var(--space-xs)" }}>
          {product.epd && (
            <span className="label-small text-primary whitespace-nowrap" style={{ fontWeight: 700 }}>
              {product.epdLabel}
            </span>
          )}
          {badge && (
            <span className="inline-flex items-center label-small text-secondary whitespace-nowrap" style={{ gap: 2, fontWeight: "var(--font-weight-semibold)" }}>
              <Icon name={badge.icon} size={15} className="text-primary" />
              {badge.label}
            </span>
          )}
        </div>

        {/* Leveringsmuligheter. HIDDEN, not removed, when empty — see the file
            header. Cards must stay the same height. */}
        <div
          className="flex flex-col"
          style={{
            gap: "var(--space-xs)",
            visibility: product.levering.length > 0 ? "visible" : "hidden",
          }}
        >
          {/* Sentence case, not uppercase: this is a plain block label rather than an
              overline like the category above it. */}
          <span className="label-xsmall text-on-surface-variant">Leveringsmuligheter</span>
          <div className="flex flex-wrap" style={{ gap: "var(--space-xs)" }}>
            {product.hasDirekte && <DeliveryPill icon="storefront" label="Direkte" />}
            {product.hasGrossist && <DeliveryPill icon="local_shipping" label="Grossist" />}
          </div>
        </div>

        {/* Actions: approval pill on the left, save heart pushed right */}
        <div
          className="flex items-center justify-between w-full min-h-10 mt-auto"
          style={{ gap: "var(--space-sm)" }}
        >
          {product.isApproved && (
            <span
              className="inline-flex items-center h-8 bg-secondary-container text-secondary-container-foreground label-small"
              style={{
                gap: "var(--space-xs)",
                paddingInline: "var(--space-sm) 12px",
                borderRadius: "var(--radius-button)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              <Icon name="check_circle" size={18} fill />
              Godkjent av REMA 1000
            </span>
          )}

          {/* IconButton is button.tsx's icon variant — a non-negotiable rule of
              the design system. size="icon-xs" is the 40px variant the handoff
              specifies for icon buttons. */}
          <Button
            variant="ghost"
            size="icon-xs"
            className="ml-auto shrink-0"
            aria-label={product.saved ? "Fjern fra lagrede produkter" : "Lagre produkt"}
            aria-pressed={product.saved}
            onClick={() => {
              onSaveToggle?.();
              toggleSave(product.id);
            }}
          >
            <Icon
              name="favorite"
              fill={product.saved}
              className={product.saved ? "text-primary" : "text-on-surface-variant"}
            />
          </Button>
        </div>
      </div>
    </Card>
  );
}
