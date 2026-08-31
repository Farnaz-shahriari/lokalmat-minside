/* =============================================================================
   CATEGORY TINTS — DECORATIVE DATASET COLOURS, NOT DESIGN TOKENS
   =============================================================================

   These 12 colour pairs tint the product and producer media tiles: one pair per
   product category, plus a Material Symbols icon name.

   THEY ARE NOT BRAND COLOURS AND THEY ARE NOT IN THE DESIGN SYSTEM.
   references/colors.md does not contain them, and the design system's
   non-negotiable rules forbid raw hex in new code. This file is the one
   deliberate, reviewed exception.

   WHY THEY STAY (decision taken with the design owner, see README):
   Every media tile in this design is a PLACEHOLDER FOR A REAL PRODUCT PHOTO.
   These tints are standing in for photography, not carrying brand meaning — so
   they are dataset-owned decorative data rather than design tokens. The design
   handoff offered exactly this option ("Either accept them as data, or replace
   all 12 with a single neutral --surface-container tile") and this is it.

   THE POINT OF ISOLATING THEM HERE: when real photography arrives, every raw
   hex value in this codebase disappears in a single file deletion. Nothing
   else imports a literal colour.

   DO NOT add a 13th pair, and do not reach for these values anywhere outside a
   media tile. If you need a colour for anything else, it comes from tokens.css.
   ========================================================================== */

export interface CategoryTint {
  /** Tile background. Decorative only. */
  color: string;
  /** Icon / distance-badge ink on that tile. Decorative only. */
  ink: string;
  /** Material Symbols Outlined icon name. */
  icon: string;
}

export const CATEGORIES: string[] =
["Saft, syltetøy, geleer","Oster","Meieriprodukter","Korn- og Bakevarer","Kjøtt","Frukt og grønt","Fjærkre","Fisk og sjømat","Ferdigmat","Drikkevarer","Annet","Alkoholholdige drikker"];
export const CATEGORY_TINTS: Record<string, CategoryTint> =
{
  "Meieriprodukter": {
    "color": "#EAF0E6",
    "ink": "#3C5A2E",
    "icon": "icecream"
  },
  "Drikkevarer": {
    "color": "#FBEFE0",
    "ink": "#8A5A1B",
    "icon": "local_cafe"
  },
  "Kjøtt": {
    "color": "#F3E2DC",
    "ink": "#8C3A2A",
    "icon": "restaurant"
  },
  "Alkoholholdige drikker": {
    "color": "#ECE4D6",
    "ink": "#6E5A2E",
    "icon": "sports_bar"
  },
  "Fisk og sjømat": {
    "color": "#E2ECEE",
    "ink": "#2E5E66",
    "icon": "set_meal"
  },
  "Korn- og Bakevarer": {
    "color": "#F5ECDD",
    "ink": "#7A5A28",
    "icon": "bakery_dining"
  },
  "Frukt og grønt": {
    "color": "#E8F0DE",
    "ink": "#4A6A2A",
    "icon": "nutrition"
  },
  "Saft, syltetøy, geleer": {
    "color": "#F6E5E0",
    "ink": "#9A4530",
    "icon": "local_florist"
  },
  "Annet": {
    "color": "#ECEAE6",
    "ink": "#5A564E",
    "icon": "inventory_2"
  },
  "Oster":     { "color":"#F6F0DC", "ink":"#7A641E", "icon":"brunch_dining" },
  "Fjærkre":   { "color":"#F4EBDE", "ink":"#8A5A28", "icon":"egg" },
  "Ferdigmat": { "color":"#EDEAE3", "ink":"#5E5A50", "icon":"dinner_dining" }
};
/** Neutral fallback for a category with no tint defined. */
export const FALLBACK_TINT: CategoryTint = {
  color: "#EEEDEA",
  ink: "#555555",
  icon: "inventory_2",
};

export function tintFor(category: string | undefined): CategoryTint {
  return (category && CATEGORY_TINTS[category]) || FALLBACK_TINT;
}
