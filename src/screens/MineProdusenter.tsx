/* Screen 2 — Mine produsenter. */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OutlinedTextField } from "../components/ui/outlined-text-field";
import { Button } from "../components/ui/button";
import { CategoryChips } from "../components/CategoryChips";
import { ProducerCard } from "../components/ProducerCard";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { CATEGORIES } from "../data/lokalmat-data";
import { emptyFilters, matchProducer } from "../lib/search";
import { useApp } from "../state/AppState";
import { useLinger } from "../lib/useLinger";
import { Lingering } from "../components/Lingering";

export function MineProdusenter() {
  const navigate = useNavigate();
  /* Unfollowing here deletes the card from this very list. Hold it a moment so
     the change is visible first. See src/lib/useLinger.ts. */
  const linger = useLinger();
  const {
    producers,
    producerSearch,
    setProducerSearch,
    producerFilters,
    toggleProducerFilter,
    openSearch,
    setSearch,
  } = useApp();

  const followed = useMemo(() => producers.filter((p) => p.followed), [producers]);

  /* Built from ALL producers matching the search and category filters, then
     narrowed to followed ones — plus any just-unfollowed row still lingering.
     Filtering by search or category still removes rows immediately, which is
     correct; only a follow toggle triggers the hold. */
  const visible = useMemo(
    () =>
      producers
        .filter((p) => matchProducer(p, producerSearch))
        .filter(
          (p) =>
            !producerFilters.length ||
            p.categories.some((c) => producerFilters.includes(c)),
        )
        .filter((p) => p.followed || linger.isLingering(p.id)),
    // linger.version changes when a hold starts or ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [producers, producerSearch, producerFilters, linger.version, linger.isLingering],
  );

  /** Opens the search screen with empty filters and FORCES scope to Produsenter. */
  function findMoreProducers() {
    openSearch(emptyFilters());
    setSearch({ scope: "produsenter" });
    navigate("/sok");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function openProducer(name: string) {
    openSearch({ ...emptyFilters(), query: name });
    navigate("/sok");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <div style={{ marginTop: "var(--space-xl)" }}>
      <div
        className="flex items-center justify-between flex-wrap"
        style={{ gap: "var(--space-md)", marginBottom: "var(--space-md)" }}
      >
        <h2 className="title-large text-on-surface m-0">
          Produsenter du følger{" "}
          <span className="text-on-surface-variant" style={{ fontWeight: "var(--font-weight-normal)" }}>
            · {followed.length}
          </span>
        </h2>
        <Button size="sm" onClick={findMoreProducers}>
          <Icon name="add" size={18} />
          Finn flere produsenter
        </Button>
      </div>

      <div className="max-w-[520px]" style={{ marginBottom: "var(--space-md)" }}>
        <OutlinedTextField
          label="Søk i produsenter"
          value={producerSearch}
          onChange={(e) => setProducerSearch(e.target.value)}
          icon={<Icon name="search" size={20} />}
        />
      </div>

      <div style={{ marginBottom: "var(--space-lg)" }}>
        <CategoryChips
          categories={CATEGORIES}
          selected={producerFilters}
          onToggle={toggleProducerFilter}
        />
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          {visible.map((p) => (
            <Lingering key={p.id} leaving={!p.followed && linger.isLeaving(p.id)} gap={16}>
              <ProducerCard
                producer={p}
                onView={() => openProducer(p.name)}
                onFollowToggle={() => linger.linger(p.id)}
              />
            </Lingering>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="storefront"
          message="Ingen produsenter å vise. Juster filtrene, eller finn nye produsenter å følge."
        />
      )}
    </div>
  );
}
