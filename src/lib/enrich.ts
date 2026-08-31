/* =============================================================================
   ENRICHERS
   Turn a raw Producer / Product record into everything the cards need to render:
   distance, org.nr, category tint, follow and save state, delivery options,
   EPD number, freshness badges.

   Ported from the prototype's enrichProduct() / enrichProducer(). The hash-based
   synthesis below is deliberately deterministic — the same product always gets
   the same EPD number and the same delivery options across reloads.
   ========================================================================== */

import {
  MAP_CENTER,
  distanceKm,
  type ApprovalState,
  type Producer,
  type Product,
} from "../data/lokalmat-data";
import { tintFor, type CategoryTint } from "../data/category-tints";

export interface EnrichedProducer extends Producer {
  distance: number;
  followed: boolean;
  tint: CategoryTint;
  /** ⚠ FAKE. Hashed from the producer id into a plausible 9-digit number.
      Replace with the real Brønnøysund organisation number in production. */
  orgNr: string;
  categoriesText: string;
}

export interface EnrichedProduct extends Product {
  region: string;
  county: string;
  tint: CategoryTint;
  saved: boolean;
  approval: ApprovalState;
  isApproved: boolean;
  isNew: boolean;
  isUpdated: boolean;
  producerFollowed: boolean;
  /** Up to two of "Direkte" / "Grossist". May be empty. */
  levering: string[];
  hasDirekte: boolean;
  hasGrossist: boolean;
  epd: string | null;
  epdLabel: string;
}

/** 16-bit string hash, matches the prototype's `_h`. */
function hash16(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return h;
}

/** 32-bit string hash used only for the fake org.nr. */
function hash32(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 131 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function enrichProducer(
  pr: Producer,
  followed: ReadonlySet<string>,
): EnrichedProducer {
  const h = hash32(String(pr.id) + "orgnr");
  const nine = String(900000000 + (h % 99999999)).slice(0, 9);
  return {
    ...pr,
    distance: Math.round(distanceKm(MAP_CENTER, pr)),
    followed: followed.has(pr.id),
    tint: tintFor(pr.categories[0]),
    orgNr: `Org.nr ${nine.slice(0, 3)} ${nine.slice(3, 6)} ${nine.slice(6, 9)}`,
    categoriesText: pr.categories.join(" · "),
  };
}

export function enrichProduct(
  p: Product,
  producersById: ReadonlyMap<string, Producer>,
  saved: ReadonlySet<number>,
  followed: ReadonlySet<string>,
  approvalOverrides: ReadonlyMap<number, ApprovalState>,
): EnrichedProduct {
  const pr = producersById.get(p.producerId);
  const ap = approvalOverrides.get(p.id) ?? p.approval;

  // Deterministic synthesis, identical to the prototype's.
  const rnd = hash16(String(p.id)) % 10;
  const levering =
    rnd === 0 ? [] : rnd <= 4 ? ["Direkte"] : rnd <= 7 ? ["Grossist"] : ["Direkte", "Grossist"];

  const epd =
    hash16(String(p.id) + "epd") % 10 < 8
      ? String(100000 + (hash16(String(p.id) + "epd2") % 900000))
      : null;

  // ~30% of products get both "Nå i sesong" and "Oppdatert".
  const forceBoth = hash16(String(p.id) + "fresh") % 10 <= 2;
  const inSeason = forceBoth ? true : !!p.inSeason;
  const fresh = forceBoth ? "oppdatert" : p.fresh;

  return {
    ...p,
    region: pr?.region ?? "",
    county: pr?.county ?? "",
    tint: tintFor(p.category),
    saved: saved.has(p.id),
    approval: ap,
    isApproved: ap === "godkjent",
    isNew: fresh === "nyhet",
    isUpdated: fresh === "oppdatert",
    inSeason,
    producerFollowed: followed.has(p.producerId),
    levering,
    hasDirekte: levering.includes("Direkte"),
    hasGrossist: levering.includes("Grossist"),
    epd,
    epdLabel: epd ? `EPD: ${epd}` : "EPD: —",
  };
}
