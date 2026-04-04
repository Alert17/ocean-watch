import type { StyleSpecification } from "maplibre-gl";

/** Style raster OSM — teinte « eau » ajustée côté CSS sur le conteneur. */
export function oceanBasemapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap",
      },
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm",
        paint: {
          "raster-saturation": -0.45,
          "raster-brightness-max": 0.82,
          "raster-contrast": 0.08,
        },
      },
    ],
  };
}
