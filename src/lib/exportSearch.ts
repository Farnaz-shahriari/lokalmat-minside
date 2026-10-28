/* =============================================================================
   EXCEL EXPORT — the current search, as a real .xlsx workbook
   =============================================================================
   A buyer who has narrowed a search down to something useful needs to get it
   out of the browser: into a purchasing meeting, an e-mail, a supplier
   shortlist. This writes the whole result set to a spreadsheet.

   THREE SHEETS, deliberately:
     Produkter    every product in the current result set
     Produsenter  every producer in the current result set
     Søk          what the search actually was

   The third sheet is not decoration. Once the file is e-mailed on, nobody can
   tell what produced it — the Søk sheet records the query, every applied
   filter, the radius and the hit counts, so the numbers stay accountable.

   BOTH scopes are exported, not just the tab you are looking at. The header
   already reports both counts ("24 produkter · 7 produsenter"), so a buyer who
   exports from the Produkter tab would be surprised to lose the producers.
   Excel has sheets; use them.

   ⚠ COLUMN NAMES ARE THE CONTRACT. These headers end up in spreadsheets that
   get filtered, pivoted and shared outside the product. Renaming one silently
   breaks somebody's saved workbook — treat them as published API, not copy.
   ========================================================================== */

import writeXlsxFile, { getSheetData, type Column, type SheetData } from "write-excel-file/browser";
import type { EnrichedProducer, EnrichedProduct } from "./enrich";
import type { SearchState } from "../state/AppState";
import { UNLIMITED_RADIUS } from "./search";

/** Read a design token at runtime. Excel cannot resolve CSS variables, so the
    brand colour has to be resolved to a literal here — same approach MapPanel
    already uses for MapLibre. The token stays the source of truth. */
function token(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const yesNo = (v: boolean) => (v ? "Ja" : "Nei");

/** Norwegian label for the three approval states. */
function approvalLabel(state: EnrichedProduct["approval"]): string {
  if (state === "godkjent") return "Godkjent";
  if (state === "til-behandling") return "Til behandling";
  return "Ikke vurdert";
}

/** At most one freshness marker, same precedence the card uses. */
function statusLabel(p: EnrichedProduct): string {
  if (p.isNew) return "Nyhet";
  if (p.isUpdated) return "Oppdatert";
  return "";
}

function headerCell(text: string) {
  return {
    value: text,
    fontWeight: "bold" as const,
    backgroundColor: token("--secondary", "#0D310D"),
    color: token("--secondary-foreground", "#FFFFFF"),
    align: "left" as const,
  };
}

/* ---------------------------------------------------------------- Produkter */
const productColumns: Column<EnrichedProduct>[] = [
  { header: headerCell("Produkt"), width: 42, cell: (p) => p.name },
  { header: headerCell("Produsent"), width: 28, cell: (p) => p.producer },
  { header: headerCell("Kategori"), width: 22, cell: (p) => p.category },
  { header: headerCell("Underkategori"), width: 20, cell: (p) => p.subcategory ?? "" },
  { header: headerCell("EPD"), width: 12, cell: (p) => p.epd ?? "" },
  { header: headerCell("Fylke"), width: 16, cell: (p) => p.county },
  { header: headerCell("Leveringsmuligheter"), width: 22, cell: (p) => p.levering.join(", ") },
  { header: headerCell("Sesong"), width: 12, cell: (p) => p.sesong },
  { header: headerCell("Nå i sesong"), width: 13, cell: (p) => yesNo(p.inSeason) },
  { header: headerCell("Status"), width: 13, cell: (p) => statusLabel(p) },
  { header: headerCell("Godkjenning"), width: 16, cell: (p) => approvalLabel(p.approval) },
  { header: headerCell("Lokalmat"), width: 11, cell: (p) => yesNo(p.lokalmat) },
  { header: headerCell("Lagret"), width: 10, cell: (p) => yesNo(p.saved) },
  { header: headerCell("Følger produsent"), width: 17, cell: (p) => yesNo(p.producerFollowed) },
  { header: headerCell("Beskrivelse"), width: 60, cell: (p) => p.description ?? "" },
  { header: headerCell("Lenke"), width: 40, cell: (p) => p.url ?? "" },
];

/* -------------------------------------------------------------- Produsenter */
const producerColumns: Column<EnrichedProducer>[] = [
  { header: headerCell("Produsent"), width: 30, cell: (p) => p.name },
  // ⚠ Placeholder data in the prototype — real Brønnøysund numbers in production.
  { header: headerCell("Org.nr"), width: 18, cell: (p) => p.orgNr.replace(/^Org\.nr\s*/, "") },
  { header: headerCell("Sted"), width: 18, cell: (p) => p.town },
  { header: headerCell("Fylke"), width: 16, cell: (p) => p.county },
  { header: headerCell("Antall produkter"), width: 17, cell: (p) => p.productCount },
  { header: headerCell("Kategorier"), width: 34, cell: (p) => p.categories.join(", ") },
  { header: headerCell("Avstand (km)"), width: 14, cell: (p) => p.distance },
  { header: headerCell("Markedsordning"), width: 26, cell: (p) => p.marked.join(", ") },
  { header: headerCell("Revisjoner"), width: 30, cell: (p) => p.rev.join(", ") },
  { header: headerCell("Salgskanaler"), width: 28, cell: (p) => p.salg.join(", ") },
  { header: headerCell("Følger"), width: 10, cell: (p) => yesNo(p.followed) },
  { header: headerCell("Beskrivelse"), width: 70, cell: (p) => p.blurb },
];

/* --------------------------------------------------------------------- Søk */
function searchSheet(
  search: SearchState,
  counts: { products: number; producers: number },
  savedSearchName: string | null,
): SheetData {
  const label = (t: string) => ({ value: t, fontWeight: "bold" as const, align: "left" as const });
  const row = (k: string, v: string | number) => [label(k), v];
  const list = (v: string[]) => (v.length ? v.join(", ") : "—");

  return [
    [headerCell("Søket"), headerCell("Verdi")],
    row("Eksportert", new Date().toLocaleString("nb-NO")),
    row("Lagret søk", savedSearchName ?? "Ad-hoc søk"),
    row("Søkeord", search.query.trim() || "—"),
    row("Kategori", list(search.cats)),
    row("Fylke", list(search.fylker)),
    row("Markedsordning", list(search.marked)),
    row("Revisjoner", list(search.rev)),
    row("Salgskanaler", list(search.salg)),
    row("Sesonger", list(search.sesong)),
    row("Radius", search.radius < UNLIMITED_RADIUS ? `Innen ${search.radius} km` : "Hele landet"),
    row("Kun Lokalmat", yesNo(search.lokalmatOnly)),
    row("Treff, produkter", counts.products),
    row("Treff, produsenter", counts.producers),
  ];
}

/** `Mitt søk` -> `mitt-soek`, safe for a filename on any OS. */
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function exportFileName(savedSearchName: string | null, now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  const base = savedSearchName ? slug(savedSearchName) : "sok";
  return `lokalmat-${base}-${date}.xlsx`;
}

export interface SearchExport {
  products: EnrichedProduct[];
  producers: EnrichedProducer[];
  search: SearchState;
  savedSearchName: string | null;
}

/** Build the workbook. Separated from the download so it can be tested. */
export function buildSearchWorkbook({ products, producers, search, savedSearchName }: SearchExport) {
  return [
    {
      sheet: "Produkter",
      data: getSheetData(products, productColumns),
      columns: productColumns.map((c) => ({ width: c.width })),
      stickyRowsCount: 1,
    },
    {
      sheet: "Produsenter",
      data: getSheetData(producers, producerColumns),
      columns: producerColumns.map((c) => ({ width: c.width })),
      stickyRowsCount: 1,
    },
    {
      sheet: "Søk",
      data: searchSheet(search, { products: products.length, producers: producers.length }, savedSearchName),
      columns: [{ width: 24 }, { width: 60 }],
    },
  ];
}

/** Writes the file to the user's downloads. Returns the filename used. */
export async function exportSearchToExcel(input: SearchExport): Promise<string> {
  const fileName = exportFileName(input.savedSearchName);
  await writeXlsxFile(buildSearchWorkbook(input)).toFile(fileName);
  return fileName;
}
