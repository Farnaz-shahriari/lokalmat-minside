/* Screen 3 — Mine produkter.

   Sorting note: Produktnavn and Produsent use Norwegian collation
   (localeCompare with 'nb'), so æ ø å sort correctly. */

import { useMemo } from "react";
import { OutlinedTextField } from "../components/ui/outlined-text-field";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CategoryChips } from "../components/CategoryChips";
import { ProductCard } from "../components/ProductCard";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";
import { CATEGORIES } from "../data/lokalmat-data";
import { matchProduct } from "../lib/search";
import { compareNb } from "../lib/format";
import { useApp, type ProductSort } from "../state/AppState";
import { useLinger } from "../lib/useLinger";
import { Lingering } from "../components/Lingering";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recent", label: "Nylig lagt til" },
  { value: "name", label: "Produktnavn" },
  { value: "producer", label: "Produsent" },
];

export function MineProdukter() {
  /* Un-saving here deletes the card from this very list. Same treatment as the
     follow lists. See src/lib/useLinger.ts. */
  const linger = useLinger();
  const {
    products,
    productSearch,
    setProductSearch,
    productFilters,
    toggleProductFilter,
    onlyApproved,
    setOnlyApproved,
    productSort,
    setProductSort,
  } = useApp();

  const savedProducts = useMemo(() => products.filter((p) => p.saved), [products]);

  const visible = useMemo(() => {
    let list = products
      .filter((p) => p.saved || linger.isLingering(String(p.id)))
      .filter((p) => matchProduct(p, productSearch))
      .filter((p) => !productFilters.length || productFilters.includes(p.category))
      .filter((p) => !onlyApproved || p.isApproved);

    if (productSort === "name") list = [...list].sort((a, b) => compareNb(a.name, b.name));
    else if (productSort === "producer")
      list = [...list].sort((a, b) => compareNb(a.producer, b.producer));

    return list;
    // linger.version changes when a hold starts or ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, productSearch, productFilters, onlyApproved, productSort, linger.version, linger.isLingering]);

  return (
    <div style={{ marginTop: "var(--space-xl)" }}>
      <h2 className="title-large text-on-surface m-0" style={{ marginBottom: "var(--space-md)" }}>
        Lagrede produkter{" "}
        <span className="text-on-surface-variant" style={{ fontWeight: "var(--font-weight-normal)" }}>
          · {savedProducts.length}
        </span>
      </h2>

      <div
        className="flex items-center flex-wrap"
        style={{ gap: "var(--space-lg)", marginBottom: "var(--space-md)" }}
      >
        <div className="flex-1 min-w-[280px] max-w-[420px]">
          <OutlinedTextField
            label="Søk i produkter"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            icon={<Icon name="search" size={20} />}
          />
        </div>

        <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
          <Switch
            id="only-approved"
            checked={onlyApproved}
            onCheckedChange={setOnlyApproved}
          />
          <Label htmlFor="only-approved" className="body-medium text-on-surface cursor-pointer">
            Vis kun godkjente produkter
          </Label>
        </div>

        <div className="w-[200px] ml-auto">
          <Select value={productSort} onValueChange={(v) => setProductSort(v as ProductSort)}>
            <SelectTrigger aria-label="Sorter etter" className="w-full">
              <SelectValue placeholder="Sorter etter" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-lg)" }}>
        <CategoryChips
          categories={CATEGORIES}
          selected={productFilters}
          onToggle={toggleProductFilter}
        />
      </div>

      {visible.length > 0 ? (
        <div className="flex flex-wrap" style={{ gap: "var(--space-md)" }}>
          {visible.map((p) => (
            <div key={p.id} className="w-[320px] shrink-0">
              <Lingering variant="fade" leaving={!p.saved && linger.isLeaving(String(p.id))}>
                <ProductCard
                  product={p}
                  onSaveToggle={() => linger.linger(String(p.id))}
                />
              </Lingering>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="favorite"
          message="Ingen lagrede produkter her ennå. Lagre produkter du vil følge med på, så samles de her."
        />
      )}
    </div>
  );
}
