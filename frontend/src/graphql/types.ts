export type Zone = {
  id: string;
  name: string;
  slug: string;
  /** Ring of [lng, lat] */
  polygon: [number, number][];
};

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
  zoneId: string | null;
  zoneName: string | null;
};

export type SubmitSightingInput = {
  latitude: number;
  longitude: number;
  species: string;
  count: number;
  behavior: string;
  observedAt: string;
  comment?: string;
  zoneId?: string;
};
