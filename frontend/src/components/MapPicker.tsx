import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Zone } from "../graphql/types";
import { findZoneForPoint } from "../lib/geo";

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

/** Leaflet attend [lat, lng] */
const COZUMEL_CENTER: L.LatLngExpression = [20.42, -86.92];

const zoneStyle: L.PathOptions = {
  color: "#38bdf8",
  weight: 1.5,
  opacity: 0.75,
  fillColor: "#2dd4bf",
  fillOpacity: 0.14,
};

function zonesToFeatureCollection(zones: Zone[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: zones.map((z) => ({
      type: "Feature",
      properties: { id: z.id, name: z.name },
      geometry: {
        type: "Polygon",
        coordinates: [z.polygon.map(([lng, lat]) => [lng, lat])],
      },
    })),
  };
}

const pickIcon = L.divIcon({
  className: "ocean-watch-map-marker",
  html: `<div style="width:16px;height:16px;border-radius:9999px;border:2px solid #061222;background:#2dd4bf;box-shadow:0 0 20px -6px rgba(45,212,191,0.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function MapPicker({ zones, value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: COZUMEL_CENTER,
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (zones.length > 0) {
      L.geoJSON(zonesToFeatureCollection(zones), { style: () => zoneStyle }).addTo(
        map,
      );
    }

    const onMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const zoneId = findZoneForPoint(lng, lat, zones);
      onChangeRef.current({ lng, lat, zoneId });
    };

    map.on("click", onMapClick);
    mapRef.current = map;

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

    if (!value) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const { lat, lng } = value;
    const latLng: L.LatLngExpression = [lat, lng];

    if (!markerRef.current) {
      markerRef.current = L.marker(latLng, { icon: pickIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng(latLng);
    }
  }, [value]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-lagoon-500/25 shadow-card ring-1 ring-white/5"
    >
      <div
        ref={containerRef}
        className="ocean-watch-leaflet-map h-[min(52vh,22rem)] w-full hue-rotate-[12deg] saturate-[0.85] brightness-[0.92] contrast-[1.05]"
        role="application"
        aria-label="Carte des zones d’observation autour de Cozumel"
      />
    </div>
  );
}
