export enum Species {
  NURSE_SHARK = "nurse_shark",
  CARIBBEAN_REEF_SHARK = "caribbean_reef_shark",
  GREAT_HAMMERHEAD_SHARK = "great_hammerhead_shark",
  HAMMERHEAD_SHARK = "hammerhead_shark",
  BULL_SHARK = "bull_shark",
  TIGER_SHARK = "tiger_shark",
  UNKNOWN = "unknown",
}

export enum Behavior {
  FEEDING = "feeding",
  MIGRATING = "migrating",
  RESTING = "resting",
  MATING = "mating",
  HUNTING = "hunting",
  STRANDED = "stranded",
  UNKNOWN = "unknown",
}

export interface MirrorMessage {
  consensus_timestamp: string;
  sequence_number: number;
  message: string;
}

export interface MirrorResponse {
  messages: MirrorMessage[];
  links?: { next?: string };
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
