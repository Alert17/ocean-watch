import { graphqlClient } from "./client";
import { SIGHTING_QUERY, SIGHTINGS_QUERY } from "./documents";
import type { Sighting } from "./types";

type SightingsResponse = { sightings: Sighting[] };
type SightingResponse = { sighting: Sighting | null };

export async function fetchSightings(): Promise<Sighting[]> {
  const data = await graphqlClient.request<SightingsResponse>(SIGHTINGS_QUERY);
  return data.sightings;
}

export async function fetchSightingById(id: string): Promise<Sighting | null> {
  const data = await graphqlClient.request<SightingResponse>(SIGHTING_QUERY, {
    id,
  });
  return data.sighting;
}
