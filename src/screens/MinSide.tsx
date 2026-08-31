/* Screen 1 — Min side (home).
   Five stacked sections, 40px (space-xl) apart. */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { SavedSearchCard } from "../components/SavedSearchCard";
import { ScopeTabs } from "../components/ScopeTabs";
import { CategoryChips } from "../components/CategoryChips";
import { PillSearch } from "../components/PillSearch";
import { MapPanel, type MapProducer } from "../components/MapPanel";
import { ProducerMini } from "../components/ProducerMini";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { Chip } from "../components/ui/chip";
import { Icon } from "../components/Icon";
import { CATEGORIES, COMMON_SEARCHES } from "../data/lokalmat-data";
import { unfollowedCountText } from "../lib/format";
import { emptyFilters } from "../lib/search";
import { useApp } from "../state/AppState";

/* The Produsenter scope has its own chip set — these are producer-shaped
   queries, not the product-shaped COMMON_SEARCHES. "Gårdsutsalg" deliberately
   queries the broader "Gård". */
const PRODUSENT_SEARCHES = [
  { label: "Bryggeri", query: "Bryggeri" },
  { label: "Gårdsutsalg", query: "Gård" },
  { label: "Meieri", query: "Meieri" },
  { label: "Bakeri", query: "Bakeri" },
  { label: "Vestland", query: "Vestland" },
  { label: "Trøndelag", query: "Trøndelag" },
  { label: "Innlandet", query: "Innlandet" },
];

/* The dataset ships 5 common searches. Only the first 4 are shown, so the
   suggestion chips always sit on a single line at this page width.

   Worth knowing before changing this number: our chips are already identical to
   the design's (14px/500, 32px tall, 16px side padding, 8px radius, 1px
   outline-variant border) — measured against the visual reference. The design
   fits all 5 on one line only because its search box is ~48px wider than ours,
   a knock-on effect of the 1280px page-width decision. So the fix is fewer
   chips, not smaller ones.

   The dropped entry is the longest, "Sesongbaserte produkter i nærheten", which
   also overlaps in meaning with "Kortreiste grønnsaker sesong". The dataset is
   left intact so nothing is lost if the layout changes later. */
const HOME_SUGGESTION_LIMIT = 4;

const SECTION_GAP = { marginTop: "var(--space-xl)" } as const;

export function MinSide() {
  const navigate = useNavigate();
  const {
    producers,
    products,
    savedSearches,
    search,
    setSearch,
    openSearch,
    mapRadius,
    setMapRadius,
    mapCats,
    toggleMapCat,
  } = useApp();

  /* ---- a. Nytt i dine lagrede søk. Only searches with new hits appear. ---- */
  const notifications = savedSearches.filter((s) => s.count > 0);

  /* ---- b. Search box. Heading, placeholder and chips all change with scope. */
  const isProdusenter = search.scope === "produsenter";
  const findHeading = isProdusenter
    ? "Finn produsenter fra hele Norge!"
    : "Finn produkter og produsenter fra hele Norge!";
  const searchPlaceholder = isProdusenter
    ? "Søk på produsentnavn eller organisasjonsnummer"
    : "Hva leter du etter? F.eks. «økologisk melk Rogaland»";
  const scopeSearches = isProdusenter
    ? PRODUSENT_SEARCHES
    : COMMON_SEARCHES.slice(0, HOME_SUGGESTION_LIMIT).map((c) => ({ label: c, query: c }));

  /** Run a query from the home box.
      The current scope tab is CARRIED OVER, not reset — searching from the
      Produsenter tab must land on Produsenter results. Regression guard: this
      was a real bug in an earlier revision of the design. */
  function runSearch(query: string) {
    const scope = search.scope;
    openSearch({ ...emptyFilters(), query });
    setSearch({ scope });
    navigate("/sok");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---- c. Produsenter i ditt område. Only producers NOT followed. -------- */
  const unfollowed = useMemo(() => producers.filter((p) => !p.followed), [producers]);

  const mapProducers: MapProducer[] = useMemo(
    () => unfollowed.map((p) => ({ ...p, inRadius: p.distance <= mapRadius })),
    [unfollowed, mapRadius],
  );

  const inRadiusCount = mapProducers.filter((p) => p.inRadius).length;

  const nearbyList = useMemo(() => {
    let list = mapProducers.filter((p) => p.inRadius);
    if (mapCats.length) list = list.filter((p) => p.categories.some((c) => mapCats.includes(c)));
    return list.sort((a, b) => a.distance - b.distance).slice(0, 8);
  }, [mapProducers, mapCats]);

  /* ---- d. Oppdateringer: one product per followed producer, preferring
            something new / updated / in season. ---------------------------- */
  const feedProducts = useMemo(() => {
    const byProducer = new Map<string, typeof products>();
    products.forEach((p) => {
      const arr = byProducer.get(p.producerId) ?? [];
      arr.push(p);
      byProducer.set(p.producerId, arr);
    });
    return producers
      .filter((pr) => pr.followed)
      .map((pr) => {
        const own = byProducer.get(pr.id) ?? [];
        return own.find((p) => p.isNew || p.isUpdated || p.inSeason) ?? own[0];
      })
      .filter(Boolean);
  }, [producers, products]);

  /* ---- e. Godkjent av REMA 1000 ----------------------------------------- */
  const approvedProducts = useMemo(
    () => products.filter((p) => p.isApproved).slice(0, 8),
    [products],
  );

  /** Open a producer by running a search for its name. */
  const openProducer = (name: string) => runSearch(name);

  return (
    <div>
      {/* ===== a. Nytt i dine lagrede søk ===== */}
      {notifications.length > 0 && (
        <section style={SECTION_GAP}>
          <SectionHeading
            title="Nytt i dine lagrede søk"
            linkLabel="Se alle lagrede søk"
            linkTo="/lagrede-sok"
            style={{ marginBottom: "var(--space-md)" }}
          />
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "var(--space-md)",
            }}
          >
            {notifications.map((s) => (
              <SavedSearchCard
                key={s.id}
                search={s}
                onOpen={() => {
                  openSearch(s.filters, s.id);
                  navigate("/sok");
                  window.scrollTo({ top: 0, behavior: "auto" });
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== b. Search box ===== */}
      <section
        className="flex flex-col bg-surface border border-outline-variant"
        style={{
          ...SECTION_GAP,
          borderRadius: "var(--radius-card)",
          padding: "var(--space-2xl) var(--space-xl)",
          gap: "var(--space-md)",
        }}
      >
        <h2 className="title-medium text-on-surface m-0">{findHeading}</h2>

        <ScopeTabs value={search.scope} onChange={(scope) => setSearch({ scope })} />

        <div className="flex items-center flex-wrap" style={{ gap: "var(--space-md)", paddingBlock: "var(--space-sm)" }}>
          <PillSearch
            className="w-[720px] max-w-full flex-1 min-w-[280px]"
            value={search.draft}
            onChange={(draft) => setSearch({ draft })}
            onSubmit={() => runSearch(search.draft)}
            placeholder={searchPlaceholder}
          />
          <Button size="default" onClick={() => runSearch(search.draft)}>
            <Icon name="search" size={20} />
            Søk
          </Button>
        </div>

        <div className="flex flex-wrap items-center" style={{ gap: "var(--space-sm)", paddingBlock: "var(--space-sm)" }}>
          <span className="body-large text-on-surface-variant" style={{ fontWeight: "var(--font-weight-medium)", marginRight: "var(--space-xs)" }}>
            Vanlige søk:
          </span>
          {scopeSearches.map((c) => (
            <Chip key={c.label} variant="suggestion" onClick={() => runSearch(c.query)}>
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* ===== c. Produsenter i ditt område ===== */}
      <section style={SECTION_GAP}>
        <SectionHeading
          title="Produsenter i ditt område"
          linkLabel="Se mine produsenter"
          linkTo="/produsenter"
          style={{ marginBottom: "var(--space-md)" }}
        />
        <div style={{ marginBottom: "var(--space-md)" }}>
          <CategoryChips
            categories={CATEGORIES.slice(0, 6)}
            selected={mapCats}
            onToggle={toggleMapCat}
          />
        </div>
        <div
          className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-start"
          style={{ gap: "var(--space-lg)" }}
        >
          <MapPanel
            producers={mapProducers}
            radius={mapRadius}
            onRadiusChange={setMapRadius}
            countText={unfollowedCountText(inRadiusCount)}
            onOpenProducer={(p) => openProducer(p.name)}
          />
          <div className="flex flex-col" style={{ gap: "12px" }}>
            {nearbyList.map((p) => (
              <ProducerMini key={p.id} producer={p} onOpen={() => openProducer(p.name)} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== d. Oppdateringer fra produsenter du følger ===== */}
      <section style={SECTION_GAP}>
        <SectionHeading title="Oppdateringer fra produsenter du følger" style={{ marginBottom: "var(--space-md)" }} />
        <div className="lm-scroll-row flex overflow-x-auto pb-2.5" style={{ gap: "var(--space-md)" }}>
          {feedProducts.map((p) => (
            <div key={p.id} className="shrink-0 w-[320px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== e. Godkjent av REMA 1000 ===== */}
      <section style={SECTION_GAP}>
        <SectionHeading
          title="Godkjent av REMA 1000"
          linkLabel="Se mine produkter"
          linkTo="/produkter"
          style={{ marginBottom: "var(--space-md)" }}
        />
        <div className="lm-scroll-row flex overflow-x-auto pb-2.5" style={{ gap: "var(--space-md)" }}>
          {approvedProducts.map((p) => (
            <div key={p.id} className="shrink-0 w-[320px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
