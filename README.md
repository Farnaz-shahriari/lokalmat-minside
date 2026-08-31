# Lokalmat "Min side" — buyer portal

A logged-in area of **Lokalmat.no** for a buyer/innkjøper (grocery chain purchaser):
discover Norwegian local-food producers and products, follow producers, save products,
run and save searches, and get notified when saved searches produce new hits.

Five screens, one app shell, fully stateful — filtering, following, saving, search and
map interaction all actually run.

Built from two sources:

- **Design intent** — `design_handoff_lokalmat_min_side`, a Claude Design handoff
  (layout, copy, spacing, states, interactions).
- **Implementation rules** — [`norskmat-design-system`](https://github.com/Farnaz-shahriari/norskmat-design-system),
  the Norsk Mat design system (tokens, components, non-negotiable rules).

Where the two disagreed, the design system won unless noted under
[Deviations](#deviations-from-the-design-system).

---

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. Other scripts: `npm run build`, `npm run preview`,
`npm run typecheck`.

---

## Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · React Router 6 · MapLibre GL 4

Chosen to match the design system: its components are `.tsx`, and its `tokens.css`
already uses Tailwind v4's `@theme inline`. The build is fully static, so it hosts
anywhere.

---

## How the design system is wired in

| What | Where | Rule |
|---|---|---|
| Tokens | `src/styles/tokens.css` | **Copied verbatim** from `norskmat-design-system/assets/tokens.css`. Never edit here — change it upstream and re-copy. |
| Components | `src/components/ui/` | Copied verbatim from `assets/components/`, with only the Figma-Make `@version` import suffixes stripped. Those exact versions are pinned in `package.json`, so behaviour is unchanged. |
| Platform | `src/main.tsx` | Applies `.theme-lokalmat` to `<html>`. Every other Norsk Mat platform is one class swap away. |

**No raw hex, px, or radius values in application code.** Everything reads a token.
The one deliberate, reviewed exception is documented in `src/data/category-tints.ts`.

Design system components used as-is: `button`, `card`, `chip`, `dialog`, `select`,
`slider`, `alert`, `input`, `label`, `badge`, `avatar`, `checkbox`, `switch`,
`list-item`, `connected-button-group`, `tabs`, `outlined-text-field`, `separator`,
`dropdown-menu`.

Two rules worth restating because they are easy to get wrong here:

- **Icon buttons are `button.tsx`'s icon variant** (`size="icon-xs"` = 40px), never
  hand-rolled.
- **The follow toggle is a `Chip`, not a `Button`.** Following is a persistent
  selected state, not a one-shot action. See `src/components/FollowChip.tsx`.

---

## Project layout

```
src/
  components/ui/      design system components, copied verbatim
  components/         app components (cards, top bar, map, nav)
  screens/            the five screens
  data/               dataset + the isolated category tints
  lib/                search/matching, enrichers, formatting
  state/              one store for global follow/save/search state
  styles/             tokens.css (verbatim) + fonts + app CSS
```

Routes: `/min-side` · `/produsenter` · `/produkter` · `/lagrede-sok` · `/sok`

---

## Decisions taken

| Question | Decision |
|---|---|
| Page width | **1280px**, per the handoff, not `spacing.md`'s 1680px. See Deviations. |
| Category tints | Kept as **dataset-owned decorative data**, isolated in one file. |
| Fonts | **Google stand-ins** for the unlicensed Messina fonts. See below. |
| Responsive | **Desktop-first with graceful stacking** at the system's breakpoints. No compact-breakpoint design exists yet. |
| Nav tab cards | Kept **bespoke**. See Deviations. |

---

## ⚠ Open issues and known gaps

### 1. Fonts are stand-ins, not the brand typefaces

LokalMat's real fonts are **Messina Serif** and **Messina Sans** (Luzi Type,
commercially licensed). They are not in any repository — logged as known gap #9 in the
design system's `references/colors.md`.

We substituted **Source Serif 4** and **Inter** from Google Fonts so headings do not
collapse into a generic system font. **Anything typeset here is approximately, not
exactly, on-brand — do not present a screenshot as final brand typography.**

`src/styles/fonts.css` carries the full explanation and a six-step checklist for
swapping in the real files. The whole change is confined to that one file.

Serif is used in exactly **three** places (greeting h1, search page title, producer name
on ProducerCard) and nowhere else. Do not widen it.

### 2. The map uses OpenFreeMap, not CARTO

The handoff specifies CARTO `light_all` (Positron) and flags "confirm the CARTO
licence". That question answered itself: **CARTO's keyless tiles now render a large
"API KEY REQUIRED" watermark across every tile.** Positron is no longer available
without a paid CARTO account.

The map now uses **OpenFreeMap Positron** — an open, community-run rebuild of the very
same Positron style, so the design's intended look is *preserved exactly* rather than
approximated. Free forever, no API key, no signup, no rate limits, OpenStreetMap data,
and self-hostable if you ever want the tiles on your own infrastructure.

Positron is served as **vector** tiles, which is why the map uses MapLibre GL rather
than Leaflet's raster layers. Vector also keeps the map crisp at every zoom level and
on high-DPI screens.

Kartverket's `topograatone` was tried first and rejected: it is a *topographic* map, so
terrain shading and contour tints made it far warmer and busier than the flat basemap
the design calls for.

MapLibre needs WebGL. Where it is unavailable (locked-down VDI, very old browser) the
map degrades to a labelled placeholder and the radius slider keeps working, rather than
breaking the page.

### 3. Org.nr is fake

Producer organisation numbers are hashed from the producer id into plausible 9-digit
numbers. **Replace with real Brønnøysund numbers.** They are load-bearing: the producer
search matches on org.nr digits.

### 4. Everything is a static dataset

`src/data/lokalmat-data.ts` is the prototype bundle. Production needs producers (with
lat/lng), products, categories and filter definitions, the user's followed/saved sets,
and saved searches with unseen-hit counts. **The unseen-hit count is a server concern** —
it drives the Min side notification section and the e-mail notifications.

Products are real (from `lokalmat_50_produkter_komplett.xlsx`). Producer regions,
coordinates, blurbs and approval statuses are believable sample data.

### 5. "REMA 1000" is hard-coded as the approving chain

It appears in the UI and in the seed user. Confirm whether it is real, per-user, or
placeholder.

---

## Deviations from the design system

Three, all deliberate and all commented at the point of use.

1. **Page width is 1280px, not 1680px.** `spacing.md` says 1680 "everywhere, no
   exceptions". The handoff argues this is a reading/browsing surface, not a dense data
   workspace. Confirmed with the design owner. Isolated in one constant:
   `PAGE_MAX_WIDTH` in `src/components/Layout.tsx`.

2. **The four nav tab cards are bespoke.** They are 104px icon cards, which no existing
   component expresses — `ConnectedButtonGroup` is a 40px pill segmented control.
   Redefining it is a design system decision, not an app one. `104px` is the only
   untokenised height in this app, and the handoff's own height table says
   "custom, no token; keep 104".

3. **Raw hex in `src/data/category-tints.ts`.** 12 decorative tint pairs for the media
   tiles, which are placeholders for real product photography. Isolated so that when
   photos arrive, every raw colour in the codebase disappears in one file deletion.

---

## Feedback for the design system

Found while building. All are gaps in `norskmat-design-system`, not in this app — filed
here so they can be fixed upstream rather than re-patched by the next project.

**Undefined tokens that components already reference** (both worked around in
`src/styles/app.css`, clearly marked):

- `--input-background` — `input`, `checkbox`, `select`, `textarea` and `input-otp` all
  use the Tailwind class `bg-input-background`, but `tokens.css` maps `--input` only.
  The class currently resolves to nothing.
- `--radius` — `outlined-text-field.tsx` uses `rounded-[var(--radius)]`, but `tokens.css`
  defines `--radius-sm` / `-button` / `-card` / `-dialog` and no bare `--radius`.

Same class of bug as the missing `--outline` and the incomplete `@theme` mapping already
documented as known gaps 6–8 in `references/colors.md`.

**`ListItem` API limits.** The handoff maps `ProducerMini` and `SavedSearchCard` onto
`ListItem`, but two things block using it wholesale (see the header comment in
`src/components/ProducerMini.tsx`):

- Its leading slot is a hard-coded 24px box (`w-6 h-6`). Both designs need a 44–52px
  leading tile. A sizeable leading slot would fix this.
- It renders as a `<button>`, so an interactive trailing control (the follow icon button)
  cannot go in `trailingIcon` — that would nest a button inside a button. A
  non-interactive variant, or a trailing slot rendered outside the button, would fix it.

**`chip.tsx` uses a raw radius.** `rounded-[8px]`, where the system's own rule says every
rounded corner must use one of the four radius tokens.

**Confirmed working:** the corrected `switch.tsx` renders LokalMat's `#A80000` when
checked, not KSL olive. The `tokens.css` LokalMat block, including `--outline-variant`,
is correct. The handoff's blockers 1–3 are already resolved upstream.

---

## Deploying

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes to
GitHub Pages on every push to `main`.

**One-time setup after you create the repo and push:**
GitHub → repo → **Settings → Pages → Source: GitHub Actions** (not "Deploy from a
branch").

The workflow sets `BASE_PATH` from the repo name so assets resolve under the Pages
project path, and copies `index.html` to `404.html` so client-side routes survive a hard
refresh.

To host at a domain root instead (Vercel, Netlify), leave `BASE_PATH` unset —
`vite.config.ts` defaults `base` to `/`.
