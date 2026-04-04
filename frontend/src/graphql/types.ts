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
