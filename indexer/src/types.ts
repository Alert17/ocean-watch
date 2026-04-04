export enum Species {
  WHITE_SHARK = "white_shark",
}

export enum Behavior {
  FEEDING = "feeding",
  MIGRATING = "migrating",
  RESTING = "resting",
  PLAYING = "playing",
  HUNTING = "hunting",
  STRANDED = "stranded",
  UNKNOWN = "unknown",
}

export interface Sighting {
  id: string;
  latitude: number;
  longitude: number;
  species: Species;
  count: number;
  behavior: Behavior;
  observedAt: string;
  createdAt: string;
  comment?: string;
  mediaUrl?: string;
  wallet: string;
  sequenceNumber: number;
  consensusTimestamp: string;
}
