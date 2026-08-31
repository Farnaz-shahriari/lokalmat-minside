/* =============================================================================
   SEARCH & MATCHING
   Ported from the prototype's renderVals(). The rules below are the spec, taken
   from the handoff's "Matching" and "Filters" sections — keep them exact.
   ========================================================================== */

import type { EnrichedProducer, EnrichedProduct } from "./enrich";
import type { SavedSearchFilters } from "../data/lokalmat-data";

/** Norwegian stopwords dropped from every query before matching. */
const STOPWORDS = [
  "og", "i", "til", "fra", "på", "av", "en", "et", "de",
  "med", "for", "som", "den", "det",
];

/**
 * Case-insensitive, tokenised on whitespace/commas, tokens under 2 chars
 * dropped, Norwegian stopwords removed.
 */
export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.includes(t));
}

/**
 * A product matches if ANY remaining token appears in its searchable text
 * (name + producer + category + subcategory + description).
 * An empty query matches everything.
 */
export function matchProduct(p: EnrichedProduct, q: string): boolean {
  const ts = tokenize(q || "");
  if (!ts.length) return true;
  const text = [p.name, p.producer, p.category, p.subcategory, p.description]
    .join(" ")
    .toLowerCase();
  return ts.some((t) => text.includes(t));
}

/**
 * A producer matches on name + region + blurb + org.nr + categories.
 * PLUS: if the query contains 3 or more digits it is matched against the digits
 * of the org.nr — this is what makes the "Søk på produsentnavn eller
 * organisasjonsnummer" placeholder actually true.
 */
export function matchProducer(pr: EnrichedProducer, q: string): boolean {
  const raw = (q || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 3 && (pr.orgNr || "").replace(/\D/g, "").includes(digits))
    return true;
  const ts = tokenize(raw);
  if (!ts.length) return true;
  const text = [pr.name, pr.region, pr.blurb, pr.orgNr]
    .concat(pr.categories)
    .join(" ")
    .toLowerCase();
  return ts.some((t) => text.includes(t));
}

/** Radius of 900 km means "everything" — the slider's maximum. */
export const UNLIMITED_RADIUS = 900;

export function emptyFilters(): SavedSearchFilters {
  return {
    query: "",
    cats: [],
    fylker: [],
    marked: [],
    rev: [],
    salg: [],
    sesong: [],
    radius: UNLIMITED_RADIUS,
    approvedOnly: false,
  };
}

/**
 * Normalise a filter set for comparison: arrays sorted, query trimmed. Used for
 * the saved-search dirty check, so re-selecting the same filters in a different
 * order does NOT mark a saved search as modified.
 */
export function normalizeFilters(f: Partial<SavedSearchFilters>): SavedSearchFilters {
  const e = emptyFilters();
  return {
    query: (f.query || "").trim(),
    cats: [...(f.cats || [])].sort(),
    fylker: [...(f.fylker || [])].sort(),
    marked: [...(f.marked || [])].sort(),
    rev: [...(f.rev || [])].sort(),
    salg: [...(f.salg || [])].sort(),
    sesong: [...(f.sesong || [])].sort(),
    radius: f.radius ?? e.radius,
    approvedOnly: !!f.approvedOnly,
  };
}

export function sameFilters(
  a: Partial<SavedSearchFilters>,
  b: Partial<SavedSearchFilters>,
): boolean {
  return JSON.stringify(normalizeFilters(a)) === JSON.stringify(normalizeFilters(b));
}

/**
 * The grey summary pills on a saved-search row, and the basis for the active
 * filter chips. Order is fixed: the query in guillemets first, then every
 * selected value in group order, then radius, then approved-only.
 * Truncated to 6.
 */
export function summarizeFilters(f: SavedSearchFilters): string[] {
  const out: string[] = [];
  if (f.query) out.push(`«${f.query}»`);
  (["cats", "fylker", "marked", "rev", "salg", "sesong"] as const).forEach((k) =>
    (f[k] || []).forEach((v) => out.push(v)),
  );
  if (f.radius && f.radius < UNLIMITED_RADIUS) out.push(`Innen ${f.radius} km`);
  if (f.approvedOnly) out.push("Kun godkjente");
  return out.slice(0, 6);
}

/** Toggle a value in and out of a multi-select array. */
export function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}
