/* Screen 5 — Søk. The most complex screen.

   LAYOUT NOTE: the page header spans the FULL WIDTH, above both panes. This was
   a deliberate revision in the design — do not nest it inside the results
   column.

   Filters are AND across groups, OR within a group. Radius always applies
   (900 km = everything). Product results additionally inherit their producer's
   geographic and producer-level filters. */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Chip } from "../components/ui/chip";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { OutlinedTextField } from "../components/ui/outlined-text-field";
import { PillSearch } from "../components/PillSearch";
import { ScopeTabs } from "../components/ScopeTabs";
import { MapPanel, type MapProducer } from "../components/MapPanel";
import { ProductCard } from "../components/ProductCard";
import { ProducerCard } from "../components/ProducerCard";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { CATEGORIES, FILTER_DEFS } from "../data/lokalmat-data";
import type { EnrichedProducer } from "../lib/enrich";
import { UNLIMITED_RADIUS, matchProducer, matchProduct } from "../lib/search";
import { useApp, type FilterKey } from "../state/AppState";

/** The six checkbox filter groups, in the order the design specifies. */
const FILTER_GROUPS: { title: string; key: FilterKey; options: string[] }[] = [
  { title: "Kategori", key: "cats", options: CATEGORIES },
  { title: "Fylke", key: "fylker", options: FILTER_DEFS.fylker },
  { title: "Markedsordning", key: "marked", options: FILTER_DEFS.markedsordning },
  { title: "Revisjoner", key: "rev", options: FILTER_DEFS.revisjoner },
  { title: "Salgskanaler", key: "salg", options: FILTER_DEFS.salgskanaler },
  { title: "Sesonger", key: "sesong", options: FILTER_DEFS.sesonger },
];

export function Sok() {
  const navigate = useNavigate();
  const {
    producers,
    products,
    search,
    setSearch,
    toggleSearchFilter,
    resetSearch,
    activeSavedSearch,
    savedIsDirty,
    createSavedSearch,
    updateActiveSavedSearch,
    deleteSavedSearch,
    savedMessage,
  } = useApp();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  /* ---- producer-level predicate, shared by both scopes ------------------- */
  const producerOk = useMemo(() => {
    return (pr: EnrichedProducer): boolean => {
      if (pr.distance > search.radius) return false;
      if (search.fylker.length && !search.fylker.includes(pr.county)) return false;
      if (search.marked.length && !pr.marked.some((x) => search.marked.includes(x)))
        return false;
      if (search.rev.length && !pr.rev.some((x) => search.rev.includes(x))) return false;
      if (search.salg.length && !pr.salg.some((x) => search.salg.includes(x))) return false;
      return true;
    };
  }, [search.radius, search.fylker, search.marked, search.rev, search.salg]);

  const producersById = useMemo(
    () => new Map(producers.map((p) => [p.id, p])),
    [producers],
  );

  const productResults = useMemo(
    () =>
      products
        .filter((p) => matchProduct(p, search.query))
        .filter((p) => !search.cats.length || search.cats.includes(p.category))
        .filter((p) => !search.sesong.length || search.sesong.includes(p.sesong))
        .filter((p) => !search.approvedOnly || p.isApproved)
        .filter((p) => {
          const pr = producersById.get(p.producerId);
          return pr ? producerOk(pr) : true;
        }),
    [products, search.query, search.cats, search.sesong, search.approvedOnly, producersById, producerOk],
  );

  const producerResults = useMemo(
    () => producers.filter((p) => matchProducer(p, search.query)).filter(producerOk),
    [producers, search.query, producerOk],
  );

  const mapProducers: MapProducer[] = useMemo(
    () => producers.map((p) => ({ ...p, inRadius: p.distance <= search.radius })),
    [producers, search.radius],
  );

  /* ---- active filter chips: every applied filter, removable -------------- */
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (search.query)
      chips.push({
        label: `«${search.query}»`,
        onRemove: () => setSearch({ draft: "", query: "" }),
      });
    (["cats", "fylker", "marked", "rev", "salg", "sesong"] as FilterKey[]).forEach((key) => {
      search[key].forEach((v) =>
        chips.push({ label: v, onRemove: () => toggleSearchFilter(key, v) }),
      );
    });
    if (search.radius < UNLIMITED_RADIUS)
      chips.push({
        label: `Innen ${search.radius} km`,
        onRemove: () => setSearch({ radius: UNLIMITED_RADIUS }),
      });
    if (search.approvedOnly)
      chips.push({ label: "Kun godkjente", onRemove: () => setSearch({ approvedOnly: false }) });
    return chips;
  }, [search, setSearch, toggleSearchFilter]);

  const isProdukter = search.scope === "produkter";
  const results = isProdukter ? productResults : producerResults;

  const title = activeSavedSearch ? activeSavedSearch.name : "Søk i hele Norge";

  return (
    <div>
      {/* ================= Page header, spans BOTH panes ================= */}
      <div
        className="border-b border-outline-variant"
        style={{ marginTop: "var(--space-lg)", paddingBottom: "var(--space-md)" }}
      >
        {/* Pulled 8px left to optically align with the title below. */}
        <div style={{ margin: "0 0 var(--space-xs) -8px" }}>
          <Button variant="tertiary" size="sm" onClick={() => navigate(-1)}>
            <Icon name="arrow_back" size={18} />
            Tilbake
          </Button>
        </div>

        <div className="flex items-end justify-between flex-wrap" style={{ gap: "var(--space-lg)" }}>
          <div className="flex flex-col min-w-0" style={{ gap: "var(--space-xs)" }}>
            {/* SERIF. One of the three sanctioned usages, see fonts.css. */}
            <h1 className="font-brand-serif headline-medium text-on-surface m-0">{title}</h1>
            <div className="flex items-center flex-wrap" style={{ gap: "var(--space-sm)" }}>
              {activeSavedSearch && (
                <span className="inline-flex items-center label-xsmall lm-overline text-primary" style={{ gap: "var(--space-xs)" }}>
                  <Icon name="bookmark" size={15} fill />
                  Lagret søk
                </span>
              )}
              <span className="body-medium text-on-surface-variant">
                {productResults.length} produkter · {producerResults.length} produsenter
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0" style={{ gap: "var(--space-sm)" }}>
            <button
              type="button"
              onClick={resetSearch}
              className="label-large text-primary bg-transparent border-0 cursor-pointer"
              style={{ fontWeight: "var(--font-weight-semibold)", padding: "var(--space-sm) 6px" }}
            >
              Nullstill
            </button>

            {/* Only when an open saved search has been modified. */}
            {savedIsDirty && (
              <Button size="sm" onClick={() => updateActiveSavedSearch()}>
                <Icon name="save" size={18} />
                Lagre endringer
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSaveName(activeSavedSearch ? `${activeSavedSearch.name} (kopi)` : "");
                setDialogOpen(true);
              }}
            >
              <Icon name="bookmark_add" size={18} />
              {activeSavedSearch ? "Lagre som nytt" : "Lagre søk"}
            </Button>

            {activeSavedSearch && (
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Slett lagret søk"
                onClick={() => deleteSavedSearch(activeSavedSearch.id)}
              >
                <Icon name="delete" size={20} className="text-on-surface-variant" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ================= Body: sidebar + results ================= */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[330px_minmax(0,1fr)] items-start"
        style={{ marginTop: "var(--space-lg)", gap: "var(--space-lg)" }}
      >
        {/* ---------------- Sidebar ---------------- */}
        <aside className="flex flex-col min-w-0">
          {/* On THIS screen typing filters live — no Enter needed. */}
          <PillSearch
            className="mb-3.5"
            iconSize={22}
            value={search.draft}
            onChange={(draft) => setSearch({ draft, query: draft })}
            placeholder={isProdukter ? "Søk i produkter" : "Søk på navn eller org.nr"}
          />

          <div className="flex items-center" style={{ gap: "var(--space-sm)", margin: "0 0 var(--space-md) var(--space-xs)" }}>
            <Switch
              id="search-approved"
              checked={search.approvedOnly}
              onCheckedChange={(v) => setSearch({ approvedOnly: v })}
            />
            <Label htmlFor="search-approved" className="body-medium text-on-surface cursor-pointer">
              Vis kun godkjente produkter
            </Label>
          </div>

          <MapPanel
            producers={mapProducers}
            radius={search.radius}
            onRadiusChange={(km) => setSearch({ radius: km })}
            countText={`${mapProducers.filter((p) => p.inRadius).length} av ${producers.length} produsenter`}
          />

          <div style={{ marginTop: "var(--space-sm)" }}>
            {FILTER_GROUPS.map((g) => (
              <div
                key={g.key}
                className="border-b border-outline-variant"
                style={{ paddingBlock: "var(--space-md)" }}
              >
                <h3
                  className="body-medium text-on-surface m-0"
                  style={{ fontWeight: 700, marginBottom: "var(--space-xs)" }}
                >
                  {g.title}
                </h3>
                <div className="flex flex-col">
                  {g.options.map((o) => {
                    const id = `${g.key}-${o}`;
                    return (
                      <div key={o} className="flex items-center min-h-[38px]" style={{ gap: "var(--space-sm)" }}>
                        <Checkbox
                          id={id}
                          checked={search[g.key].includes(o)}
                          onCheckedChange={() => toggleSearchFilter(g.key, o)}
                        />
                        <Label htmlFor={id} className="body-medium text-on-surface cursor-pointer">
                          {o}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ---------------- Results ---------------- */}
        <div className="flex flex-col min-w-0">
          {/* Confirmation, auto-dismisses after 3s (handled in AppState). */}
          {savedMessage && (
            <Alert
              className="bg-secondary-container text-secondary-container-foreground border-transparent"
              style={{ marginBottom: "12px", borderRadius: "var(--radius-card)" }}
            >
              <Icon name="check_circle" size={20} fill />
              <AlertDescription className="text-secondary-container-foreground">
                Søket «{savedMessage}» er lagret. Du finner det under Lagrede søk.
              </AlertDescription>
            </Alert>
          )}

          {activeChips.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              {activeChips.map((c) => (
                <Chip
                  key={c.label}
                  variant="input"
                  selected
                  onClick={c.onRemove}
                  trailingIcon={<Icon name="close" size={18} />}
                  aria-label={`Fjern filter: ${c.label}`}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          )}

          <div style={{ marginBottom: "var(--space-md)" }}>
            <ScopeTabs value={search.scope} onChange={(scope) => setSearch({ scope })} />
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon="search_off"
              message="Ingen treff. Prøv et annet søkeord eller fjern noen filtre."
            />
          ) : isProdukter ? (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: "var(--space-md)",
              }}
            >
              {productResults.map((p) => (
                <div key={p.id} className="min-w-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
              {producerResults.map((p) => (
                <ProducerCard key={p.id} producer={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= Lagre søk dialog ================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ borderRadius: "var(--radius-dialog)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center title-medium" style={{ gap: "var(--space-sm)" }}>
              <Icon name="bookmark_add" size={22} className="text-primary" />
              Lagre søk
            </DialogTitle>
            <DialogDescription className="body-medium text-on-surface-variant">
              Gi søket et navn. Vi varsler deg under «Lagrede søk» når nye produkter
              passer søket.
            </DialogDescription>
          </DialogHeader>

          <div style={{ paddingBlock: "var(--space-sm)" }}>
            <OutlinedTextField
              label="Navn på søket"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="tertiary" size="sm" onClick={() => setDialogOpen(false)}>
              Avbryt
            </Button>
            <Button
              size="sm"
              onClick={() => {
                createSavedSearch(saveName);
                setDialogOpen(false);
                setSaveName("");
              }}
            >
              <Icon name="bookmark_add" size={18} />
              Lagre søk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
