/* The Produkter | Produsenter scope switch. Appears twice: in the Min side
   search box and above the Søk results.

   Built from the design system's Tab / TabGroup (assets/components/tabs.tsx),
   which is the "secondary variant" the handoff asks for — a text tab with a 2px
   primary underline on the active item.

   FULL-WIDTH BY DESIGN: measured against the design reference, each tab is
   `flex: 1 1 auto` inside a full-width group, so the two tabs split whatever
   space their container gives them and the active underline spans that whole
   half. That is the design system component's own behaviour, so it applies in
   both places this is used — the tabs are as wide as the search box on Min
   side, and as wide as the results column on Søk. Everything else (48px height,
   label-medium, the 2px primary indicator) already came from Tab unchanged. */

import { Tab, TabGroup } from "./ui/tabs";
import type { Scope } from "../state/AppState";

const TABS: { value: Scope; label: string }[] = [
  { value: "produkter", label: "Produkter" },
  { value: "produsenter", label: "Produsenter" },
];

export function ScopeTabs({
  value,
  onChange,
}: {
  value: Scope;
  onChange: (v: Scope) => void;
}) {
  return (
    <TabGroup scrollable={false} className="w-full border-b border-outline-variant">
      {TABS.map((t) => (
        <Tab
          key={t.value}
          className="flex-1"
          active={value === t.value}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </Tab>
      ))}
    </TabGroup>
  );
}
