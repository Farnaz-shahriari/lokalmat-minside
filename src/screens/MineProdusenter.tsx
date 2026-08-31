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

export function MineProdusenter() {
  const navigate = useNavigate();
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

  const visible = useMemo(
    () =>
      followed
        .filter((p) => matchProducer(p, producerSearch))
        .filter(
          (p) =>
            !producerFilters.length ||
            p.categories.some((c) => producerFilters.includes(c)),
        ),
    [followed, producerSearch, producerFilters],
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
            <ProducerCard key={p.id} producer={p} onView={() => openProducer(p.name)} />
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
