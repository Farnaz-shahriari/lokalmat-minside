/* MapPanel — the basemap + radius slider.

   NOT a design-system component; the handoff says so explicitly.

   ============================================================================
   BASEMAP — why this is MapLibre + OpenFreeMap, not Leaflet + CARTO
   ============================================================================
   The handoff specifies CARTO `light_all` (Positron) raster tiles, and flags
   "confirm the CARTO licence for production use".

   That question answered itself: CARTO's keyless tiles now render a large
   diagonal "API KEY REQUIRED" watermark across every tile. Positron is no
   longer available without a paid CARTO account.

   We use OPENFREEMAP POSITRON instead. It is an open, community-run rebuild of
   the very same Positron style — same palette, same label treatment — so the
   design's intended look is preserved exactly rather than approximated:

     - free forever, no API key, no signup, no rate limits
     - OpenStreetMap data, openly licensed
     - self-hostable if you ever want the tiles on your own infrastructure

   The one consequence: Positron is served as VECTOR tiles, which need MapLibre
   GL rather than Leaflet's raster layers. That is why this component uses
   MapLibre. Vector also means the map stays crisp at every zoom level and on
   high-DPI screens, which raster tiles do not.

   Kartverket's `topograatone` was tried first and rejected: it is a
   TOPOGRAPHIC map, so terrain shading and contour tints made it far warmer and
   busier than the flat basemap the design calls for.

   MapLibre needs WebGL. If it is unavailable (locked-down VDI, very old
   browser) the component degrades to a labelled placeholder rather than
   breaking the page — see `failed` below.
   ============================================================================

   Every colour here reads from the CSS custom properties at runtime rather than
   being hardcoded, because MapLibre takes colours as JS strings, not classes. */

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Slider } from "./ui/slider";
import { Icon } from "./Icon";
import { MAP_CENTER } from "../data/lokalmat-data";
import type { EnrichedProducer } from "../lib/enrich";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

/** Read a design token as a string, for the MapLibre APIs that need one. */
function token(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export interface MapProducer extends EnrichedProducer {
  inRadius: boolean;
}

/**
 * A geodesic circle as a GeoJSON polygon. MapLibre has no circle-in-metres
 * primitive the way Leaflet does, so the radius overlay is drawn as a polygon
 * sampled around the centre. 96 steps is smooth at every zoom this map uses.
 */
function circlePolygon(
  lat: number,
  lng: number,
  km: number,
  steps = 96,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const R = 6371;
  const d = km / R;
  const latRad = (lat * Math.PI) / 180;
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const brng = (i / steps) * 2 * Math.PI;
    const la = Math.asin(
      Math.sin(latRad) * Math.cos(d) + Math.cos(latRad) * Math.sin(d) * Math.cos(brng),
    );
    const lo =
      (lng * Math.PI) / 180 +
      Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(latRad),
        Math.cos(d) - Math.sin(latRad) * Math.sin(la),
      );
    ring.push([(lo * 180) / Math.PI, (la * 180) / Math.PI]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } };
}

function producerFeatures(producers: MapProducer[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: producers
      .filter((p) => typeof p.lat === "number")
      .map((p) => ({
        type: "Feature",
        properties: {
          id: p.id,
          label: `${p.name} — ${p.region}`,
          inRadius: p.inRadius ? 1 : 0,
        },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
  };
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
  const map = useRef<maplibregl.Map | null>(null);
  const ready = useRef(false);
  const [failed, setFailed] = useState(false);

  // Kept in refs so redrawing never has to re-run the init effect.
  const producersRef = useRef(producers);
  producersRef.current = producers;
  const openRef = useRef(onOpenProducer);
  openRef.current = onOpenProducer;

  // --- init, once ---
  useEffect(() => {
    if (!el.current || map.current) return;

    const primary = token("--primary", "#A80000");
    // Out-of-radius markers use --outline. The prototype's #A6A69E is not a
    // token; the handoff's replacement table maps it here.
    const outline = token("--outline", "#737872");

    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: el.current,
        style: MAP_STYLE,
        center: [MAP_CENTER.lng, MAP_CENTER.lat],
        // MapLibre zoom levels sit one below Leaflet's for the same view.
        zoom: 4,
        attributionControl: { compact: true },
      });
    } catch {
      setFailed(true);
      return;
    }

    map.current = m;
    m.on("error", (e) => {
      // A failed style load leaves an unusable map; anything else (a single
      // missing tile) is transient and safe to ignore.
      if (!ready.current && e?.error) setFailed(true);
    });

    // Off, so scrolling the page over the map does not hijack the scroll.
    m.scrollZoom.disable();
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    const hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: "lm-map-popup",
    });

    m.on("load", () => {
      ready.current = true;

      // --- radius circle ---
      m.addSource("radius", { type: "geojson", data: circlePolygon(MAP_CENTER.lat, MAP_CENTER.lng, radius) });
      m.addLayer({ id: "radius-fill", type: "fill", source: "radius", paint: { "fill-color": primary, "fill-opacity": 0.1 } });
      m.addLayer({ id: "radius-line", type: "line", source: "radius", paint: { "line-color": primary, "line-width": 2 } });

      // --- producer markers ---
      m.addSource("producers", { type: "geojson", data: producerFeatures(producersRef.current) });
      m.addLayer({
        id: "producers-layer",
        type: "circle",
        source: "producers",
        paint: {
          "circle-radius": ["case", ["==", ["get", "inRadius"], 1], 7, 5],
          "circle-color": ["case", ["==", ["get", "inRadius"], 1], primary, outline],
          "circle-opacity": ["case", ["==", ["get", "inRadius"], 1], 0.95, 0.65],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      // --- the user's position ---
      m.addSource("me", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [MAP_CENTER.lng, MAP_CENTER.lat] } },
      });
      m.addLayer({
        id: "me-layer",
        type: "circle",
        source: "me",
        paint: { "circle-radius": 7, "circle-color": primary, "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" },
      });

      // --- hover tooltips + click-through ---
      const showTooltip = (label: string, lngLat: maplibregl.LngLatLike) => {
        m.getCanvas().style.cursor = "pointer";
        hoverPopup.setLngLat(lngLat).setText(label).addTo(m);
      };
      const hideTooltip = () => {
        m.getCanvas().style.cursor = "";
        hoverPopup.remove();
      };

      m.on("mousemove", "producers-layer", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [number, number];
        showTooltip(String(f.properties?.label ?? ""), [lng, lat]);
      });
      m.on("mouseleave", "producers-layer", hideTooltip);

      m.on("mousemove", "me-layer", () =>
        showTooltip(`Du er her — ${MAP_CENTER.label}`, [MAP_CENTER.lng, MAP_CENTER.lat]),
      );
      m.on("mouseleave", "me-layer", hideTooltip);

      m.on("click", "producers-layer", (e) => {
        const id = e.features?.[0]?.properties?.id;
        const found = producersRef.current.find((p) => p.id === id);
        if (found) openRef.current?.(found);
      });

      // The container is inside a flex/grid parent, so give it one nudge after
      // layout settles. MapLibre also watches the container itself.
      m.resize();
    });

    return () => {
      ready.current = false;
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- radius circle follows the slider ---
  useEffect(() => {
    if (!ready.current) return;
    const src = map.current?.getSource("radius") as maplibregl.GeoJSONSource | undefined;
    src?.setData(circlePolygon(MAP_CENTER.lat, MAP_CENTER.lng, radius));
  }, [radius]);

  // --- producer markers follow the data ---
  useEffect(() => {
    if (!ready.current) return;
    const src = map.current?.getSource("producers") as maplibregl.GeoJSONSource | undefined;
    src?.setData(producerFeatures(producers));
  }, [producers]);

  return (
    <div
      className="flex flex-col w-full overflow-hidden bg-surface border border-outline-variant"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {failed ? (
        <div className="w-full h-[392px] bg-surface-container flex flex-col items-center justify-center gap-2.5 px-6 text-center">
          <Icon name="map" size={44} className="text-on-surface-variant" />
          <p className="body-medium text-on-surface-variant m-0 max-w-[280px]">
            Kartet kunne ikke lastes. Bruk radiusvelgeren under for å filtrere på avstand.
          </p>
        </div>
      ) : (
        <div ref={el} className="w-full h-[392px] bg-surface-container" />
      )}

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
