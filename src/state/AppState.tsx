/* =============================================================================
   APP STATE
   One store for the whole prototype. In production the followed/saved sets and
   the saved searches move to the server; everything else stays client-side.

   The design's central rule: following and saving are GLOBAL. Toggling a
   producer anywhere updates every card, every list, the counts, the "i ditt
   område" section and the follow feed at once. That is why they live here and
   not in any screen.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_FOLLOWED,
  INITIAL_SAVED,
  PRODUCERS,
  PRODUCTS,
  SAVED_SEARCHES,
  type ApprovalState,
  type SavedSearch,
  type SavedSearchFilters,
} from "../data/lokalmat-data";
import { enrichProducer, enrichProduct, type EnrichedProducer, type EnrichedProduct } from "../lib/enrich";
import { sameFilters, toggleIn } from "../lib/search";

export type Scope = "produkter" | "produsenter";
export type ProductSort = "recent" | "name" | "producer";

/** The live filter state of the Søk screen. */
export interface SearchState extends SavedSearchFilters {
  /** What is in the field. On the Søk screen this equals `query` (live filtering). */
  draft: string;
  scope: Scope;
  activeSaved: string | null;
}

interface AppStateValue {
  // global sets
  followed: ReadonlySet<string>;
  saved: ReadonlySet<number>;
  toggleFollow: (producerId: string) => void;
  toggleSave: (productId: number) => void;

  // derived, enriched collections
  producers: EnrichedProducer[];
  products: EnrichedProduct[];

  // Mine produsenter
  producerSearch: string;
  setProducerSearch: (v: string) => void;
  producerFilters: string[];
  toggleProducerFilter: (c: string) => void;

  // Mine produkter
  productSearch: string;
  setProductSearch: (v: string) => void;
  productFilters: string[];
  toggleProductFilter: (c: string) => void;
  onlyApproved: boolean;
  setOnlyApproved: (v: boolean) => void;
  productSort: ProductSort;
  setProductSort: (v: ProductSort) => void;

  // Min side map
  mapRadius: number;
  setMapRadius: (km: number) => void;
  mapCats: string[];
  toggleMapCat: (c: string) => void;

  // Søk
  search: SearchState;
  setSearch: (patch: Partial<SearchState>) => void;
  toggleSearchFilter: (key: FilterKey, value: string) => void;
  resetSearch: () => void;
  openSearch: (filters?: SavedSearchFilters | null, savedId?: string) => void;

  // Lagrede søk
  savedSearches: SavedSearch[];
  createSavedSearch: (name: string) => SavedSearch;
  updateActiveSavedSearch: () => SavedSearch | undefined;
  deleteSavedSearch: (id: string) => void;
  setEmailUpdates: (id: string, v: boolean) => void;
  activeSavedSearch: SavedSearch | null;
  savedIsDirty: boolean;

  // confirmation alert, auto-dismisses after 3s
  savedMessage: string;
  flashSavedMessage: (name: string) => void;
}

export type FilterKey = "cats" | "fylker" | "marked" | "rev" | "salg" | "sesong";

const Ctx = createContext<AppStateValue | null>(null);

const emptySearchState = (): SearchState => ({
  draft: "",
  query: "",
  cats: [],
  fylker: [],
  marked: [],
  rev: [],
  salg: [],
  sesong: [],
  radius: 900,
  approvedOnly: false,
  scope: "produkter",
  activeSaved: null,
});

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [followed, setFollowed] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_FOLLOWED),
  );
  const [saved, setSaved] = useState<ReadonlySet<number>>(
    () => new Set(INITIAL_SAVED),
  );
  // Approval overrides, so "be om godkjenning" can move a product without
  // mutating the dataset. Seeded empty; the dataset value is the default.
  const [approvalOverrides] = useState<ReadonlyMap<number, ApprovalState>>(
    () => new Map(),
  );

  const [producerSearch, setProducerSearch] = useState("");
  const [producerFilters, setProducerFilters] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productFilters, setProductFilters] = useState<string[]>([]);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [productSort, setProductSort] = useState<ProductSort>("recent");

  const [mapRadius, setMapRadius] = useState(160);
  const [mapCats, setMapCats] = useState<string[]>([]);

  const [search, setSearchState] = useState<SearchState>(emptySearchState);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() =>
    SAVED_SEARCHES.map((s) => ({ ...s, filters: { ...s.filters }, emailUpdates: false })),
  );
  const [savedMessage, setSavedMessage] = useState("");

  const toggleFollow = useCallback((id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSave = useCallback((id: number) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const producers = useMemo(
    () => PRODUCERS.map((p) => enrichProducer(p, followed)),
    [followed],
  );

  const producersById = useMemo(
    () => new Map(PRODUCERS.map((p) => [p.id, p])),
    [],
  );

  const products = useMemo(
    () =>
      PRODUCTS.map((p) =>
        enrichProduct(p, producersById, saved, followed, approvalOverrides),
      ),
    [producersById, saved, followed, approvalOverrides],
  );

  const setSearch = useCallback((patch: Partial<SearchState>) => {
    setSearchState((s) => ({ ...s, ...patch }));
  }, []);

  const toggleSearchFilter = useCallback((key: FilterKey, value: string) => {
    setSearchState((s) => ({ ...s, [key]: toggleIn(s[key], value) }));
  }, []);

  /** Nullstill: clears query, all six groups, radius and approved-only —
      but KEEPS the saved search open, which immediately makes it dirty. */
  const resetSearch = useCallback(() => {
    setSearchState((s) => ({
      ...emptySearchState(),
      scope: s.scope,
      activeSaved: s.activeSaved,
    }));
  }, []);

  /** Opening a saved search zeroes its unseen-hit count — it has now been seen. */
  const openSearch = useCallback(
    (filters?: SavedSearchFilters | null, savedId?: string) => {
      const f = filters ?? emptySearchState();
      setSearchState((s) => ({
        ...emptySearchState(),
        draft: f.query || "",
        query: f.query || "",
        cats: [...(f.cats || [])],
        fylker: [...(f.fylker || [])],
        marked: [...(f.marked || [])],
        rev: [...(f.rev || [])],
        salg: [...(f.salg || [])],
        sesong: [...(f.sesong || [])],
        radius: f.radius || 900,
        approvedOnly: !!f.approvedOnly,
        // Scope is deliberately carried over, not reset. Searching from the
        // Produsenter tab must land on Produsenter results. This was a real bug
        // in an earlier revision of the design — do not reintroduce it.
        scope: s.scope,
        activeSaved: savedId ?? null,
      }));
      if (savedId) {
        setSavedSearches((list) =>
          list.map((x) => (x.id === savedId ? { ...x, count: 0 } : x)),
        );
      }
    },
    [],
  );

  const flashSavedMessage = useCallback((name: string) => {
    setSavedMessage(name);
    window.setTimeout(() => setSavedMessage(""), 3000);
  }, []);

  const snapshot = useCallback(
    (): SavedSearchFilters => ({
      query: search.query.trim(),
      cats: search.cats,
      fylker: search.fylker,
      marked: search.marked,
      rev: search.rev,
      salg: search.salg,
      sesong: search.sesong,
      radius: search.radius,
      approvedOnly: search.approvedOnly,
    }),
    [search],
  );

  /** New saved searches are created with e-mail updates ON. */
  const createSavedSearch = useCallback(
    (rawName: string): SavedSearch => {
      const name = rawName.trim() || search.query.trim() || "Mitt søk";
      const item: SavedSearch = {
        id: "c" + Date.now(),
        name,
        count: 0,
        filters: snapshot(),
        emailUpdates: true,
      };
      setSavedSearches((list) => [item, ...list]);
      setSearchState((s) => ({ ...s, activeSaved: item.id }));
      flashSavedMessage(name);
      return item;
    },
    [search.query, snapshot, flashSavedMessage],
  );

  const updateActiveSavedSearch = useCallback(() => {
    const active = savedSearches.find((x) => x.id === search.activeSaved);
    if (!active) return undefined;
    setSavedSearches((list) =>
      list.map((x) => (x.id === active.id ? { ...x, filters: snapshot() } : x)),
    );
    flashSavedMessage(active.name);
    return active;
  }, [savedSearches, search.activeSaved, snapshot, flashSavedMessage]);

  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches((list) => list.filter((x) => x.id !== id));
    setSearchState((s) => (s.activeSaved === id ? { ...s, activeSaved: null } : s));
  }, []);

  const setEmailUpdates = useCallback((id: string, v: boolean) => {
    setSavedSearches((list) =>
      list.map((x) => (x.id === id ? { ...x, emailUpdates: v } : x)),
    );
  }, []);

  const activeSavedSearch =
    savedSearches.find((x) => x.id === search.activeSaved) ?? null;

  const savedIsDirty =
    !!activeSavedSearch && !sameFilters(activeSavedSearch.filters, snapshot());

  const value: AppStateValue = {
    followed,
    saved,
    toggleFollow,
    toggleSave,
    producers,
    products,
    producerSearch,
    setProducerSearch,
    producerFilters,
    toggleProducerFilter: (c) => setProducerFilters((f) => toggleIn(f, c)),
    productSearch,
    setProductSearch,
    productFilters,
    toggleProductFilter: (c) => setProductFilters((f) => toggleIn(f, c)),
    onlyApproved,
    setOnlyApproved,
    productSort,
    setProductSort,
    mapRadius,
    setMapRadius,
    mapCats,
    toggleMapCat: (c) => setMapCats((f) => toggleIn(f, c)),
    search,
    setSearch,
    toggleSearchFilter,
    resetSearch,
    openSearch,
    savedSearches,
    createSavedSearch,
    updateActiveSavedSearch,
    deleteSavedSearch,
    setEmailUpdates,
    activeSavedSearch,
    savedIsDirty,
    savedMessage,
    flashSavedMessage,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppStateValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppStateProvider>");
  return v;
}
