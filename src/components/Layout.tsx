/* The app shell. Applies to every screen.

   PAGE WIDTH — a deliberate, documented deviation:
   references/spacing.md mandates "cap all page content at a max width of 1680px
   ... no exceptions". This app uses 1280px, which is what the design handoff
   specifies and what the visual reference was built at. The reasoning, from the
   handoff: "this is a reading/browsing surface, not a dense data workspace".
   That call was confirmed with the design owner. It is the ONLY place this app
   knowingly departs from the design system, and it is here in one constant so
   it is trivial to reverse.

   Page gutter is space-lg (24px) horizontally and on top; the prototype's 32px
   top padding rounds down to 24px per the handoff's spacing table. */

import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";
import { NavTabs } from "./NavTabs";
import { Greeting } from "./Greeting";

export const PAGE_MAX_WIDTH = 1280;

export function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <div
        className="mx-auto"
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          paddingInline: "var(--space-lg)",
          paddingTop: "var(--space-lg)",
          paddingBottom: 80,
        }}
      >
        <Greeting />
        <NavTabs />
        <Outlet />
      </div>
    </div>
  );
}
