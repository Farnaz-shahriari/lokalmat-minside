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
| Follow / save feedback | Row **holds for 3s showing its new state**, then fades out, with an M3 snackbar + Angre. See below. |
| Category filter chips | **Faceted** on Mine produsenter and Mine produkter — only categories with something behind them are offered. See below. |

---

## Follow / save feedback

Several lists are filtered by exactly the thing their own buttons toggle:
"Produsenter i ditt område" shows producers you do *not* follow, "Mine produsenter" shows
the ones you *do*, "Mine produkter" shows saved products. Toggling from inside one of
those lists deleted the row you just clicked, instantly, with no confirmation — the
prototype's behaviour, and disorienting.

The standard fix, applied here:

1. The row **stays put and renders its new state** (check / Følger / filled heart) for
   3 seconds, so you see what you did.
2. It then **fades and collapses** over 320ms, so the rows below slide up rather than
   jumping.
3. A **Material 3 snackbar** appears at the bottom — `Du følger nå Roma.` — with an
   **Angre** action for 5 seconds.

Undo reverts the change, cancels the fade, and restores the row in place.

Two implementation notes worth knowing before changing this:

- `src/lib/useLinger.ts` is **deliberately imperative** — a hold only starts when a
  toggle handler calls `linger(key)`. An earlier version detected removals by diffing
  the list, which was wrong: typing in a search box also removes rows, and those must
  disappear at once rather than linger as ghosts. Verified: searching "roma" in Mine
  produsenter drops 8 rows to 1 with zero lingering rows.
- The **snackbar is raised inside `AppState`'s follow/save actions**, not at the call
  sites, so every follow control in the app — the mini row's `+`, the producer card's
  chip, the chip on a product card — gives identical feedback automatically.

Counts and the map update immediately; only the row lingers. That is intentional — the
numbers should always tell the truth.

## Category filter chips are faceted

On **Mine produsenter** and **Mine produkter** the chip row only offers categories that
actually have something behind them. Previously all 12 were always shown, so you could
pick "Fjærkre" on a list with no poultry in it and get nothing but an empty state — a
filter that can only ever return zero results is a dead end.

The facet is computed from the set filtered by everything **except** the category
filter. That detail is what makes it usable:

- Selecting "Kjøtt" narrows the results but **does not** remove the other category
  chips — otherwise you could never pick a second one. This is the classic multi-select
  faceting trap.
- Typing in the search box **does** narrow the chips, which is what you want.
- A category that is already selected stays visible even if it stops matching anything,
  so an active filter can always be cleared. Without this, searching while a category is
  selected would hide the filter that is causing the empty result.

When no categories are left to offer, the row renders nothing rather than an empty gap.

**Not applied to two other chip/filter groups, deliberately:**

- **Min side → "Produsenter i ditt område".** Its set changes continuously as the radius
  slider is dragged, so faceting would make chips appear and disappear under the user's
  hand. It also shows only the first 6 categories by design.
- **The Søk sidebar's Kategori group.** That searches all products nationally, so nearly
  every category has hits, and it interacts with five other filter groups — faceting
  there is a larger design question about whether all six groups should facet together.

Both are easy to extend if you want them.

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

**There is no Material 3 snackbar in the library.** `sonner.tsx` is the nearest thing,
but it hard-depends on `next-themes` (a Next.js theming library) and styles toasts as a
*light* `--popover` card — an M3 snackbar is the opposite, an inverse-surface bar.
Adopting it would have meant two extra dependencies and then overriding essentially all
of its styling, so `src/components/Snackbar.tsx` is built directly on tokens instead. A
real snackbar belongs in the design system; this one is a reasonable starting point.

**M3's inverse-surface tokens are missing.** A snackbar needs `inverse-surface`,
`inverse-on-surface` and `inverse-primary`, none of which are in `tokens.css`. We mapped
them to `--on-surface` / `--surface` / `--primary-container`, which happen to be the
correct inverse pair for LokalMat — but that mapping is an app-level guess and should be
a real token trio, especially before another platform builds a snackbar.

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
