/** Matches indexer `Sighting` type (https://indexer.oceanwatch.xyz/graphql). */
export type Sighting = {
  id: string;
  latitude: number;
  longitude: number;
  species: string;
  count: number;
  behavior: string;
  observedAt: string;
  createdAt: string;
  comment: string | null;
  mediaUrl: string | null;
  wallet: string;
  sequenceNumber: number;
  consensusTimestamp: string;
};

/** Input type `SightingsFilter` on the indexer. */
export type SightingsFilterInput = {
  species?: string | null;
  behavior?: string | null;
  wallet?: string | null;
  observedAtGt?: string | null;
  observedAtLt?: string | null;
  observedAtGte?: string | null;
  observedAtLte?: string | null;
};

export type SightingsPage = {
  items: Sighting[];
  total: number;
  hasMore: boolean;
};
