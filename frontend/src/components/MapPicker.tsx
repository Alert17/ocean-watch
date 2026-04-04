import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Zone } from "../graphql/types";
import { findZoneForPoint } from "../lib/geo";
import { oceanBasemapStyle } from "../lib/mapStyle";

export type MapPick = {
  lat: number;
  lng: number;
  zoneId: string | null;
};

type Props = {
  zones: Zone[];
  value: MapPick | null;
  onChange: (next: MapPick) => void;
};

const COZUMEL_CENTER: [number, number] = [-86.92, 20.42];

function zonesToFeatureCollection(zones: Zone[]) {
  return {
    type: "FeatureCollection" as const,
    features: zones.map((z) => ({
      type: "Feature" as const,
      properties: { id: z.id, name: z.name },
      geometry: {
        type: "Polygon" as const,
        coordinates: [z.polygon.map(([lng, lat]) => [lng, lat])],
      },
    })),
  };
}

export function MapPicker({ zones, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = new maplibregl.Map({
      container: el,
      style: oceanBasemapStyle(),
      center: COZUMEL_CENTER,
      zoom: 10.85,
      touchPitch: false,
      maxPitch: 0,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    mapRef.current = map;

    const onMapClick = (e: maplibregl.MapMouseEvent) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;
      const zoneId = findZoneForPoint(lng, lat, zones);
      onChangeRef.current({ lng, lat, zoneId });
    };

    map.on("load", () => {
      map.addSource("zones", {
        type: "geojson",
        data: zonesToFeatureCollection(zones),
      });
      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": "#2dd4bf",
          "fill-opacity": 0.14,
        },
      });
      map.addLayer({
        id: "zones-line",
        type: "line",
        source: "zones",
        paint: {
          "line-color": "#38bdf8",
          "line-width": 1.6,
          "line-opacity": 0.75,
        },
      });
    });

    map.on("click", onMapClick);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.off("click", onMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, [zones]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyData = () => {
      const src = map.getSource("zones") as maplibregl.GeoJSONSource | undefined;
      src?.setData(zonesToFeatureCollection(zones));
    };

    if (map.isStyleLoaded()) applyData();
    else map.once("load", applyData);
  }, [zones]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const placeMarker = () => {
      if (!map.isStyleLoaded()) return;
      if (!value) {
        markerRef.current?.remove();
        markerRef.current = null;
        return;
      }
      const { lng, lat } = value;
      if (!markerRef.current) {
        const dot = document.createElement("div");
        dot.className =
          "h-4 w-4 rounded-full border-2 border-abyss-950 bg-reef-400 shadow-glow";
        dot.setAttribute("role", "presentation");
        markerRef.current = new maplibregl.Marker({ element: dot })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    };

    if (map.isStyleLoaded()) placeMarker();
    else map.once("load", placeMarker);
  }, [value]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-lagoon-500/25 shadow-card ring-1 ring-white/5"
      style={{ touchAction: "none" }}
    >
      <div
        ref={containerRef}
        className="h-[min(52vh,22rem)] w-full hue-rotate-[12deg] saturate-[0.85] brightness-[0.92] contrast-[1.05]"
        role="application"
        aria-label="Carte des zones d’observation autour de Cozumel"
      />
    </div>
  );
}
