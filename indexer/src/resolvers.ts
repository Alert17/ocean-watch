import { fetchSightings } from "./mirror";

export const resolvers = {
  Query: {
    sightings: async () => {
      return fetchSightings();
    },
    sighting: async (_: unknown, { id }: { id: string }) => {
      const all = await fetchSightings();
      return all.find((s) => s.id === id) ?? null;
    },
  },
};
