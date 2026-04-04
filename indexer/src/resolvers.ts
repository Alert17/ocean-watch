import { fetchSightings } from "./mirror";

export const resolvers = {
  Query: {
    sightings: async (_: unknown, { limit, offset }: { limit: number; offset: number }) => {
      const all = await fetchSightings();
      const items = all.slice(offset, offset + limit);

      return {
        items,
        total: all.length,
        hasMore: offset + limit < all.length,
      };
    },
    sighting: async (_: unknown, { id }: { id: string }) => {
      const all = await fetchSightings();
      return all.find((s) => s.id === id) ?? null;
    },
  },
};
