/* =============================================================================
   useLinger — "show the change, then leave"
   =============================================================================
   Several lists in this app are filtered by exactly the thing their own buttons
   toggle: "Produsenter i ditt område" shows producers you do NOT follow, "Mine
   produsenter" shows the ones you DO, "Mine produkter" shows saved products.
   Toggling from inside one of those lists therefore deletes the row you just
   clicked, instantly, before you can see that anything happened.

   This hook holds a key in place after the state change so the row can render
   its NEW state (check / Følger / filled heart) for a moment, then fade out.

   IT IS DELIBERATELY IMPERATIVE. An earlier design detected removals
   automatically by diffing the key list, which was wrong: typing in a search
   field also removes rows, and those must disappear at once, not linger as
   ghosts. Only an explicit `linger(key)` from a toggle handler starts the hold.
   ========================================================================== */

import { useCallback, useEffect, useReducer, useRef } from "react";

export type LingerPhase = "hold" | "exit";

export interface LingerOptions {
  /** How long the row stays put, showing its new state. */
  holdMs?: number;
  /** How long the fade/collapse takes. Must match the CSS transition. */
  exitMs?: number;
}

export interface Linger {
  /** Start holding a key in its list. Call from the toggle handler. */
  linger: (key: string) => void;
  /** Drop a key immediately, e.g. when an action is undone. */
  release: (key: string) => void;
  isLingering: (key: string) => boolean;
  /** True once the key is animating out, so the row can render its exit state. */
  isLeaving: (key: string) => boolean;
  /** Changes whenever a phase changes; use as a useMemo dependency. */
  version: number;
}

export function useLinger({ holdMs = 3000, exitMs = 320 }: LingerOptions = {}): Linger {
  const [version, bump] = useReducer((n: number) => n + 1, 0);
  const phases = useRef(new Map<string, LingerPhase>());
  const timers = useRef(new Map<string, number[]>());

  const stopTimers = useCallback((key: string) => {
    (timers.current.get(key) ?? []).forEach((t) => window.clearTimeout(t));
    timers.current.delete(key);
  }, []);

  const release = useCallback(
    (key: string) => {
      stopTimers(key);
      if (phases.current.delete(key)) bump();
    },
    [stopTimers],
  );

  const linger = useCallback(
    (key: string) => {
      stopTimers(key);
      phases.current.set(key, "hold");
      const toExit = window.setTimeout(() => {
        phases.current.set(key, "exit");
        bump();
      }, holdMs);
      const toDrop = window.setTimeout(() => {
        stopTimers(key);
        phases.current.delete(key);
        bump();
      }, holdMs + exitMs);
      timers.current.set(key, [toExit, toDrop]);
      bump();
    },
    [holdMs, exitMs, stopTimers],
  );

  const isLingering = useCallback((key: string) => phases.current.has(key), []);
  const isLeaving = useCallback((key: string) => phases.current.get(key) === "exit", []);

  // Never leave timers running after the screen goes away.
  useEffect(() => {
    const running = timers.current;
    return () => running.forEach((ts) => ts.forEach((t) => window.clearTimeout(t)));
  }, []);

  return { linger, release, isLingering, isLeaving, version };
}
