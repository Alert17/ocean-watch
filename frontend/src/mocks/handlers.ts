import { graphql, HttpResponse } from "msw";
import type { Sighting, SubmitSightingInput } from "../graphql/types";
import { initialMockSightings, MOCK_ZONES } from "./data";

let mockSightings: Sighting[] = initialMockSightings();

function zoneName(id: string | undefined): string | null {
  if (!id) return null;
  return MOCK_ZONES.find((z) => z.id === id)?.name ?? null;
}

function newId(): string {
  return crypto.randomUUID();
}

export const handlers = [
  graphql.query("Zones", () => {
    return HttpResponse.json({
      data: { zones: MOCK_ZONES },
    });
  }),

  graphql.query("MySightings", ({ variables }) => {
    const limit =
      typeof variables?.limit === "number" ? variables.limit : 50;
    return HttpResponse.json({
      data: { mySightings: mockSightings.slice(0, limit) },
    });
  }),

  graphql.mutation("SubmitSighting", ({ variables }) => {
    const input = variables?.input as SubmitSightingInput | undefined;
    if (!input) {
      return HttpResponse.json(
        { errors: [{ message: "input requis" }] },
        { status: 200 },
      );
    }

    const createdAt = new Date().toISOString();
    const zId = input.zoneId ?? null;
    const sighting: Sighting = {
      id: newId(),
      latitude: input.latitude,
      longitude: input.longitude,
      species: input.species,
      count: input.count,
      behavior: input.behavior,
      observedAt: input.observedAt,
      createdAt,
      comment: input.comment ?? null,
      zoneId: zId,
      zoneName: zId ? zoneName(zId) : null,
    };

    mockSightings = [sighting, ...mockSightings];

    return HttpResponse.json({
      data: { submitSighting: sighting },
    });
  }),
];
