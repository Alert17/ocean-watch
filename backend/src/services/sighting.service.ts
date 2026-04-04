import { v4 as uuid } from "uuid";
import { submitSighting, rewardSighting } from "../hedera";
import { Sighting, CreateSightingBody } from "../types/sighting";
import { DEFAULTS } from "../config/constants";
import { SightingReward } from "../hedera/types";

export interface SightingResult {
  sighting: Sighting;
  sequenceNumber: string | undefined;
  reward: SightingReward | null;
  rewardError?: string;
}

export function buildSighting(body: CreateSightingBody, wallet: string): Sighting {
  return {
    id: uuid(),
    latitude: body.latitude,
    longitude: body.longitude,
    species: body.species ?? DEFAULTS.species,
    count: body.count ?? DEFAULTS.count,
    behavior: body.behavior ?? DEFAULTS.behavior,
    observedAt: body.observedAt,
    createdAt: new Date().toISOString(),
    comment: body.comment,
    mediaUrl: body.mediaUrl,
    wallet,
  };
}

export async function createSighting(body: CreateSightingBody, wallet: string): Promise<SightingResult> {
  const sighting = buildSighting(body, wallet);
  const hcsResult = await submitSighting(sighting);

  let reward: SightingReward | null = null;
  let rewardError: string | undefined;
  try {
    reward = await rewardSighting(wallet);
  } catch (err) {
    rewardError = err instanceof Error ? err.message : "Unknown reward error";
  }

  return {
    sighting,
    sequenceNumber: hcsResult.sequenceNumber,
    reward,
    rewardError,
  };
}
