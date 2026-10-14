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

import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "./TopBar";
import { NavTabs } from "./NavTabs";
import { Greeting } from "./Greeting";

export const PAGE_MAX_WIDTH = 1280;

/* Routes that step OUT of the dashboard and so do not repeat its header.
   Innstillinger is a destination you leave again — its own back link is the
   way home, and repeating the greeting plus the four tab cards above it both
   pushes the page title down and offers a route to a page you are already on. */
const FULL_PAGE_ROUTES = ["/innstillinger"];

export function Layout() {
  const { pathname } = useLocation();
  const fullPage = FULL_PAGE_ROUTES.some((r) => pathname.startsWith(r));

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
        {!fullPage && (
          <>
            <Greeting />
            <NavTabs />
          </>
        )}
        <Outlet />
      </div>
    </div>
  );
}
