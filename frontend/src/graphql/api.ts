import { graphqlClient } from "./client";
import {
  MY_SIGHTINGS_QUERY,
  SUBMIT_SIGHTING_MUTATION,
  ZONES_QUERY,
} from "./documents";
import type { Sighting, SubmitSightingInput, Zone } from "./types";

type ZonesResponse = { zones: Zone[] };
type MySightingsResponse = { mySightings: Sighting[] };
type SubmitResponse = { submitSighting: Sighting };

export async function fetchZones(): Promise<Zone[]> {
  const data = await graphqlClient.request<ZonesResponse>(ZONES_QUERY);
  return data.zones;
}

export async function fetchMySightings(limit = 50): Promise<Sighting[]> {
  const data = await graphqlClient.request<MySightingsResponse>(
    MY_SIGHTINGS_QUERY,
    { limit },
  );
  return data.mySightings;
}

export async function submitSighting(
  input: SubmitSightingInput,
): Promise<Sighting> {
  const data = await graphqlClient.request<SubmitResponse>(
    SUBMIT_SIGHTING_MUTATION,
    { input },
  );
  return data.submitSighting;
}
