/* MapPanel — Leaflet map + radius slider.

   NOT a design-system component; the handoff says so explicitly. Leaflet 1.9.4.

   ============================================================================
   BASEMAP — A DELIBERATE DEVIATION FROM THE HANDOFF
   ============================================================================
   The handoff specifies CARTO's `light_all` raster tiles, and flags "Confirm
   the CARTO licence for production use, or swap to Kartverket's Norwegian
   basemap, which would suit the brand better."

   That question has now answered itself: CARTO's tiles still load, but they
   render with a large diagonal "API KEY REQUIRED" watermark across every tile.
   Keyless CARTO basemap access is no longer available. The design as specified
   is therefore not shippable without a paid CARTO account.

   We took the alternative the handoff itself named. Kartverket's `topograatone`
   (greyscale topographic) is a free, openly-licensed Norwegian government
   basemap. It is the closest visual match to CARTO light_all's muted neutral
   look — which matters, because this design puts red --primary markers on top
   and needs the basemap to stay quiet underneath.

   To go back to CARTO, uncomment the CARTO block below and supply a key.
   ============================================================================

   Every colour here reads from the CSS custom properties at runtime rather than
   being hardcoded, because Leaflet takes colours as JS strings, not classes. */

import { useEffect, useRef } from "react";
import L from "leaflet";
import { Slider } from "./ui/slider";
import { Icon } from "./Icon";
import { MAP_CENTER } from "../data/lokalmat-data";
import type { EnrichedProducer } from "../lib/enrich";

/* Kartverket topograatone, free and openly licensed. See the note above. */
const TILE_URL =
  "https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png";
const TILE_ATTRIBUTION = "&copy; <a href=\"https://www.kartverket.no/\">Kartverket</a>";
const TILE_SUBDOMAINS = "abc";

/* The handoff's original CARTO basemap. Renders an "API KEY REQUIRED"
   watermark without a paid account — restore only with a key in hand.
   const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
   const TILE_ATTRIBUTION = "&copy; OpenStreetMap &copy; CARTO";
   const TILE_SUBDOMAINS = "abcd";                                             */

/** Read a design token as a string, for the Leaflet APIs that need one. */
function token(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export interface MapProducer extends EnrichedProducer {
  inRadius: boolean;
}

export function MapPanel({
  producers,
  radius,
  onRadiusChange,
  countText,
  onOpenProducer,
}: {
  producers: MapProducer[];
  radius: number;
  onRadiusChange: (km: number) => void;
  countText: string;
  onOpenProducer?: (p: MapProducer) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const circle = useRef<L.Circle | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  // Kept in a ref so redrawing markers never has to re-run the init effect.
  const openRef = useRef(onOpenProducer);
  openRef.current = onOpenProducer;

  // --- init, once ---
  useEffect(() => {
    if (!el.current || map.current) return;

    const primary = token("--primary", "#A80000");

    const m = L.map(el.current, {
      zoomControl: true,
      // Off, so scrolling the page over the map does not hijack the scroll.
      scrollWheelZoom: false,
      attributionControl: true,
    });
    m.setView([MAP_CENTER.lat, MAP_CENTER.lng], 5);

    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      subdomains: TILE_SUBDOMAINS,
      attribution: TILE_ATTRIBUTION,
    }).addTo(m);

    circle.current = L.circle([MAP_CENTER.lat, MAP_CENTER.lng], {
      radius: radius * 1000,
      color: primary,
      weight: 2,
      fillColor: primary,
      fillOpacity: 0.1,
    }).addTo(m);

    L.circleMarker([MAP_CENTER.lat, MAP_CENTER.lng], {
      radius: 7,
      weight: 2,
      color: "#fff",
      fillColor: primary,
      fillOpacity: 1,
    })
      .addTo(m)
      .bindTooltip(`Du er her — ${MAP_CENTER.label}`, { direction: "top" });

    markers.current = L.layerGroup().addTo(m);
    map.current = m;

    // Without this the tiles render at the wrong size inside a flex/grid parent.
    const t = window.setTimeout(() => m.invalidateSize(), 200);

    return () => {
      window.clearTimeout(t);
      m.remove();
      map.current = null;
      circle.current = null;
      markers.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- radius circle ---
  useEffect(() => {
    circle.current?.setRadius(radius * 1000);
  }, [radius]);

  // --- producer markers ---
  useEffect(() => {
    const group = markers.current;
    if (!group) return;
    group.clearLayers();

    const primary = token("--primary", "#A80000");
    // Out-of-radius markers use --outline. The prototype's #A6A69E is not a
    // token; the handoff's replacement table maps it here.
    const outline = token("--outline", "#737872");

    producers.forEach((p) => {
      if (typeof p.lat !== "number") return;
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: p.inRadius ? 7 : 5,
        weight: 1.5,
        color: "#fff",
        fillColor: p.inRadius ? primary : outline,
        fillOpacity: p.inRadius ? 0.95 : 0.65,
      });
      marker.bindTooltip(`${p.name} — ${p.region}`, { direction: "top" });
      marker.on("click", () => openRef.current?.(p));
      marker.addTo(group);
    });
  }, [producers]);

  return (
    <div
      className="flex flex-col w-full overflow-hidden bg-surface border border-outline-variant"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <div ref={el} className="w-full h-[392px] bg-surface-container" />

      <div
        className="flex flex-col border-t border-outline-variant"
        style={{ gap: "var(--space-sm)", padding: "var(--space-md)" }}
      >
        <div className="flex items-center justify-between" style={{ gap: "var(--space-sm)" }}>
          <span className="inline-flex items-center label-large text-on-surface" style={{ gap: "var(--space-xs)", fontWeight: "var(--font-weight-semibold)" }}>
            <Icon name="my_location" size={18} className="text-primary" />
            Innen {radius} km fra {MAP_CENTER.label}
          </span>
          <span className="label-small text-on-surface-variant">{countText}</span>
        </div>

        <Slider
          min={30}
          max={900}
          step={10}
          value={[radius]}
          onValueChange={([v]) => onRadiusChange(v)}
          aria-label="Juster radius"
        />

        <div className="flex justify-between label-xsmall text-on-surface-variant">
          <span>30 km</span>
          <span>Juster radius for å se flere produsenter</span>
          <span>900 km</span>
        </div>
      </div>
    </div>
  );
}
