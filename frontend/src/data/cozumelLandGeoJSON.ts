/**
 * Simplified GeoJSON land polygon for Isla Cozumel.
 *
 * Used to validate that sighting coordinates fall in the sea,
 * not on land. Coordinates are [longitude, latitude] per GeoJSON spec.
 *
 * Source: manually digitised from OpenStreetMap / satellite imagery.
 * For production accuracy, replace with the full OSM coastline extract
 * (e.g. Natural Earth 10m or OpenStreetMap PBF → coastline extract).
 *
 * Ring is closed (first point === last point) and wound clockwise
 * (exterior ring per GeoJSON spec — point-in-polygon works either way).
 */

/**
 * A single GeoJSON Polygon ring for Isla Cozumel.
 * Vertices go roughly clockwise starting from the northern tip.
 * Each entry is [longitude, latitude].
 */
const COZUMEL_RING: [number, number][] = [
  // ── Northern tip ──────────────────────────────────────────
  [-86.960, 20.570],
  [-86.918, 20.563],
  [-86.878, 20.548],
  // ── NE coast ──────────────────────────────────────────────
  [-86.840, 20.528],
  [-86.805, 20.508],
  [-86.776, 20.486],
  // ── East coast (windward) ─────────────────────────────────
  [-86.753, 20.459],
  [-86.743, 20.432],
  [-86.740, 20.404],
  [-86.743, 20.375],
  [-86.751, 20.350],
  // ── SE corner ─────────────────────────────────────────────
  [-86.773, 20.320],
  [-86.804, 20.294],
  [-86.840, 20.272],
  // ── Southern tip ──────────────────────────────────────────
  [-86.888, 20.261],
  [-86.940, 20.260],
  [-86.980, 20.268],
  // ── SW corner ─────────────────────────────────────────────
  [-87.022, 20.287],
  [-87.060, 20.312],
  [-87.090, 20.344],
  // ── West coast (leeward — San Miguel) ─────────────────────
  [-87.105, 20.378],
  [-87.101, 20.410],
  [-87.087, 20.440],
  [-87.068, 20.466],
  [-87.047, 20.490],
  // ── NW coast ──────────────────────────────────────────────
  [-87.020, 20.515],
  [-86.990, 20.538],
  [-86.968, 20.556],
  // ── Close ring back to northern tip ───────────────────────
  [-86.960, 20.570],
];

/**
 * GeoJSON FeatureCollection containing land polygons for the Cozumel area.
 * Add additional Feature entries here for other nearby islands / mainland
 * sections if your sighting area extends beyond Cozumel.
 */
export const COZUMEL_LAND_GEOJSON: import("geojson").FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Isla Cozumel" },
      geometry: {
        type: "Polygon",
        coordinates: [COZUMEL_RING],
      },
    },
  ],
};
