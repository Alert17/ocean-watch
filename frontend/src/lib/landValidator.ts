/**
 * Land / sea spatial validation for OceanWatch sighting points.
 *
 * Uses the ray-casting point-in-polygon algorithm from geo.ts
 * to test whether a coordinate falls inside a land polygon defined
 * in a GeoJSON FeatureCollection.
 *
 * Public API
 * ──────────
 *   isOnLand(lng, lat, features)     → boolean
 *   snapToSea(lng, lat, features)    → [lng, lat] | null
 *   classifySightings(sightings, fc) → { sea, land }
 */

import type { Feature, FeatureCollection } from "geojson";
import type { Sighting } from "../graphql/types";
import { pointInPolygon } from "./geo";

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Collects every exterior ring from a GeoJSON FeatureCollection.
 * Supports Polygon and MultiPolygon geometries; others are ignored.
 */
function extractRings(
  features: Feature[],
): [number, number][][] {
  const rings: [number, number][][] = [];

  for (const feature of features) {
    const geom = feature.geometry;
    if (!geom) continue;

    if (geom.type === "Polygon") {
      // Exterior ring is coordinates[0]
      rings.push(geom.coordinates[0] as [number, number][]);
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates) {
        rings.push(poly[0] as [number, number][]);
      }
    }
  }

  return rings;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns `true` if the coordinate (lng, lat) falls inside any land
 * polygon defined in `features`.
 *
 * @param lng  WGS-84 longitude
 * @param lat  WGS-84 latitude
 * @param features  Array of GeoJSON Features (Polygon / MultiPolygon)
 */
export function isOnLand(
  lng: number,
  lat: number,
  features: Feature[],
): boolean {
  const rings = extractRings(features);
  return rings.some((ring) => pointInPolygon(lng, lat, ring));
}

/**
 * Tries to find the nearest sea point to (lng, lat) by probing in
 * 16 radial directions with increasing step sizes.
 *
 * Returns the first candidate point that is NOT on land, or `null`
 * if no valid sea point is found within `maxRadiusDeg` degrees (~55 km).
 *
 * @param lng           Original longitude
 * @param lat           Original latitude
 * @param features      Land polygon features
 * @param maxRadiusDeg  Search radius in degrees (default 0.5° ≈ 55 km)
 */
export function snapToSea(
  lng: number,
  lat: number,
  features: Feature[],
  maxRadiusDeg = 0.5,
): [number, number] | null {
  const DIRECTIONS = 16; // probing angles: 0°, 22.5°, 45°, …
  const STEP_DEG   = 0.005; // ~550 m per step

  for (let r = STEP_DEG; r <= maxRadiusDeg; r += STEP_DEG) {
    for (let i = 0; i < DIRECTIONS; i++) {
      const angle = (2 * Math.PI * i) / DIRECTIONS;
      const candidateLng = lng + r * Math.cos(angle);
      const candidateLat = lat + r * Math.sin(angle);

      if (!isOnLand(candidateLng, candidateLat, features)) {
        return [candidateLng, candidateLat];
      }
    }
  }

  return null; // no sea point found within search radius
}

// ── Sighting batch classification ──────────────────────────────────────────

export type SightingValidation =
  | { status: "sea";     sighting: Sighting }
  | { status: "land";    sighting: Sighting; snapped: [number, number] | null };

/**
 * Classifies an array of sightings as sea or land.
 * Land sightings include a `snapped` field with the nearest valid
 * sea coordinate, or `null` if snapping failed.
 *
 * @param sightings  Raw sighting records
 * @param geojson    Land FeatureCollection (e.g. COZUMEL_LAND_GEOJSON)
 */
export function classifySightings(
  sightings: Sighting[],
  geojson: FeatureCollection,
): { sea: Sighting[]; rejected: { sighting: Sighting; snapped: [number, number] | null }[] } {
  const sea: Sighting[] = [];
  const rejected: { sighting: Sighting; snapped: [number, number] | null }[] = [];

  for (const s of sightings) {
    if (isOnLand(s.longitude, s.latitude, geojson.features)) {
      const snapped = snapToSea(s.longitude, s.latitude, geojson.features);
      rejected.push({ sighting: s, snapped });
    } else {
      sea.push(s);
    }
  }

  return { sea, rejected };
}
