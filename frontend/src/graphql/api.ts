import { graphqlClient } from "./client";
import {
  SIGHTING_QUERY,
  SIGHTINGS_BY_IDS_QUERY,
  SIGHTINGS_QUERY,
} from "./documents";
import type { Sighting, SightingsFilterInput, SightingsPage } from "./types";

type SightingsQueryResponse = { sightings: SightingsPage };
type SightingResponse = { sighting: Sighting | null };
type SightingsByIdsResponse = { sightingsByIds: Sighting[] };

const DEFAULT_PAGE_SIZE = 100;

/**
 * Fetches all sightings by following `hasMore` until the list is exhausted.
 * For a single page only, use `fetchSightingsPage`.
 */
export async function fetchSightings(filter?: SightingsFilterInput): Promise<Sighting[]> {
  const all: Sighting[] = [];
  let offset = 0;

  while (true) {
    const page = await fetchSightingsPage({
      limit: DEFAULT_PAGE_SIZE,
      offset,
      filter,
    });
    all.push(...page.items);
    if (!page.hasMore) break;
    offset += DEFAULT_PAGE_SIZE;
  }

  return all;
}

export async function fetchSightingsPage(options: {
  limit?: number;
  offset?: number;
  filter?: SightingsFilterInput;
}): Promise<SightingsPage> {
  const data = await graphqlClient.request<SightingsQueryResponse>(SIGHTINGS_QUERY, {
    limit: options.limit ?? DEFAULT_PAGE_SIZE,
    offset: options.offset ?? 0,
    filter: options.filter ?? null,
  });
  return data.sightings;
}

export async function fetchSightingById(id: string): Promise<Sighting | null> {
  const data = await graphqlClient.request<SightingResponse>(SIGHTING_QUERY, {
    id,
  });
  return data.sighting;
}

export async function fetchSightingsByIds(ids: string[]): Promise<Sighting[]> {
  if (ids.length === 0) return [];
  const data = await graphqlClient.request<SightingsByIdsResponse>(
    SIGHTINGS_BY_IDS_QUERY,
    { ids },
  );
  return data.sightingsByIds;
}
