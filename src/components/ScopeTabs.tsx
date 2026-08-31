/* The Produkter | Produsenter scope switch. Appears twice: in the Min side
   search box and above the Søk results.

   Built from the design system's Tab / TabGroup (assets/components/tabs.tsx),
   which is the "secondary variant" the handoff asks for — a text tab with a 2px
   primary underline on the active item. */

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
    <TabGroup scrollable={false} className="border-b border-outline-variant w-fit">
      {TABS.map((t) => (
        <Tab key={t.value} active={value === t.value} onClick={() => onChange(t.value)}>
          {t.label}
        </Tab>
      ))}
    </TabGroup>
  );
}
