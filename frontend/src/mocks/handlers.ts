import { http, HttpResponse } from "msw";
import { parse, type OperationDefinitionNode } from "graphql";
import type { Sighting, SubmitSightingInput } from "../graphql/types";
import { initialMockSightings, MOCK_ZONES } from "./data";

let mockSightings: Sighting[] = initialMockSightings();

/** Correspond à toute origine + chemin `/graphql` (évite les soucis de matching des handlers `graphql.*`). */
const GRAPHQL_URL_RE = /https?:\/\/[^/]+\/graphql\/?$/;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
};

function zoneName(id: string | undefined): string | null {
  if (!id) return null;
  return MOCK_ZONES.find((z) => z.id === id)?.name ?? null;
}

function newId(): string {
  return crypto.randomUUID();
}

function getOperationName(body: {
  query?: string;
  operationName?: string | null;
}): string | undefined {
  if (body.operationName) return body.operationName;
  if (!body.query) return undefined;
  try {
    const ast = parse(body.query);
    const def = ast.definitions.find(
      (d): d is OperationDefinitionNode => d.kind === "OperationDefinition",
    );
    return def?.name?.value;
  } catch {
    return undefined;
  }
}

function gqlJson(data: Record<string, unknown>) {
  return HttpResponse.json(data, { headers: corsHeaders });
}

export const handlers = [
  http.options(GRAPHQL_URL_RE, () => {
    return new HttpResponse(null, { status: 204, headers: corsHeaders });
  }),

  http.post(GRAPHQL_URL_RE, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      query?: string;
      variables?: Record<string, unknown>;
      operationName?: string | null;
    } | null;

    if (!body?.query) {
      return gqlJson({ errors: [{ message: "Corps GraphQL invalide" }] });
    }

    const op = getOperationName(body);
    const variables = body.variables ?? {};

    if (op === "Zones") {
      return gqlJson({ data: { zones: MOCK_ZONES } });
    }

    if (op === "MySightings") {
      const limit =
        typeof variables.limit === "number" ? variables.limit : 50;
      return gqlJson({
        data: { mySightings: mockSightings.slice(0, limit) },
      });
    }

    if (op === "SubmitSighting") {
      const input = variables.input as SubmitSightingInput | undefined;
      if (!input) {
        return gqlJson({ errors: [{ message: "input requis" }] });
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
      return gqlJson({ data: { submitSighting: sighting } });
    }

    return gqlJson({
      errors: [{ message: op ? `Opération inconnue : ${op}` : "Opération sans nom" }],
    });
  }),
];
