import { fetchSightings } from "./mirror";
import { Sighting } from "./types";

interface SightingsFilter {
  species?: string;
  behavior?: string;
  wallet?: string;
  observedAtGt?: string;
  observedAtLt?: string;
  observedAtGte?: string;
  observedAtLte?: string;
}

function applyFilter(sightings: Sighting[], filter?: SightingsFilter): Sighting[] {
  if (!filter) return sightings;

  return sightings.filter((s) => {
    if (filter.species && s.species !== filter.species) return false;
    if (filter.behavior && s.behavior !== filter.behavior) return false;
    if (filter.wallet && s.wallet !== filter.wallet) return false;
    if (filter.observedAtGt && s.observedAt <= filter.observedAtGt) return false;
    if (filter.observedAtGte && s.observedAt < filter.observedAtGte) return false;
    if (filter.observedAtLt && s.observedAt >= filter.observedAtLt) return false;
    if (filter.observedAtLte && s.observedAt > filter.observedAtLte) return false;
    return true;
  });
}

export const resolvers = {
  Query: {
    sightings: async (_: unknown, { limit, offset, filter }: { limit: number; offset: number; filter?: SightingsFilter }) => {
      const all = await fetchSightings();
      const filtered = applyFilter(all, filter);
      const items = filtered.slice(offset, offset + limit);

      return {
        items,
        total: filtered.length,
        hasMore: offset + limit < filtered.length,
      };
    },
    sighting: async (_: unknown, { id }: { id: string }) => {
      const all = await fetchSightings();
      return all.find((s) => s.id === id) ?? null;
    },
    sightingsByIds: async (_: unknown, { ids }: { ids: string[] }) => {
      const all = await fetchSightings();
      const idSet = new Set(ids);
      return all.filter((s) => idSet.has(s.id));
    },
  },
};
