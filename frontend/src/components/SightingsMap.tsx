import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { behaviorLabel, speciesLabel } from "../constants/fieldbook";
import type { Sighting } from "../graphql/types";

type Props = {
  sightings: Sighting[];
};

const DEFAULT_VIEW: L.LatLngExpression = [20.42, -86.92];
const DEFAULT_ZOOM = 11;

const sightingIcon = L.divIcon({
  className: "ocean-watch-map-marker",
  html: `<div style="width:14px;height:14px;border-radius:9999px;border:2px solid #061222;background:#f43f5e;box-shadow:0 0 16px -4px rgba(244,63,94,0.55)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function popupContent(s: Sighting): HTMLElement {
  const root = document.createElement("div");
  root.className = "min-w-[200px] space-y-1.5 text-left text-slate-800";

  const title = document.createElement("div");
  title.className = "font-semibold text-abyss-950";
  title.textContent = speciesLabel(s.species);
  root.appendChild(title);

  const meta = document.createElement("div");
  meta.className = "text-xs text-slate-600";
  meta.textContent = `${formatWhen(s.observedAt)} · ${s.count} ${
    s.count === 1 ? "individual" : "individuals"
  } · ${behaviorLabel(s.behavior)}`;
  root.appendChild(meta);

  const coords = document.createElement("div");
  coords.className = "font-mono text-[11px] text-slate-500";
  coords.textContent = `${s.latitude.toFixed(5)}°, ${s.longitude.toFixed(5)}°`;
  root.appendChild(coords);

  if (s.comment) {
    const note = document.createElement("p");
    note.className = "mt-1 border-t border-slate-200 pt-1 text-xs text-slate-700";
    note.textContent = s.comment;
    root.appendChild(note);
  }

  const wallet = document.createElement("div");
  wallet.className = "text-[10px] uppercase tracking-wide text-slate-500";
  wallet.textContent = `Wallet ${s.wallet}`;
  root.appendChild(wallet);

  return root;
}

export function SightingsMap({ sightings }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: DEFAULT_VIEW,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerRef.current = group;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      group.clearLayers();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    for (const s of sightings) {
      const marker = L.marker([s.latitude, s.longitude], {
        icon: sightingIcon,
        title: speciesLabel(s.species),
      });
      marker.bindPopup(popupContent(s), { maxWidth: 280, className: "sightings-popup" });
      marker.addTo(group);
    }

    if (sightings.length === 0) {
      map.setView(DEFAULT_VIEW, DEFAULT_ZOOM);
    } else if (sightings.length === 1) {
      const s = sightings[0];
      map.setView([s.latitude, s.longitude], 12);
    } else {
      const bounds = L.latLngBounds(
        sightings.map((s) => [s.latitude, s.longitude] as L.LatLngTuple),
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [sightings]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-lagoon-500/25 shadow-card ring-1 ring-white/5"
    >
      <div
        ref={containerRef}
        className="ocean-watch-leaflet-map h-[min(55vh,24rem)] w-full min-h-[220px] hue-rotate-[12deg] saturate-[0.85] brightness-[0.92] contrast-[1.05]"
        role="application"
        aria-label="Map of indexed sightings"
      />
    </div>
  );
}
