import { http, HttpResponse, passthrough } from "msw";
import { parse, type OperationDefinitionNode } from "graphql";
import type { Sighting, SightingsFilterInput } from "../graphql/types";
import { initialMockSightings } from "./data";

let mockSightings: Sighting[] = initialMockSightings();

function applySightingsFilter(
  sightings: Sighting[],
  filter?: SightingsFilterInput | null,
): Sighting[] {
  if (!filter) return sightings;
  return sightings.filter((s) => {
    if (filter.species && s.species !== filter.species) return false;
    if (filter.behavior && s.behavior !== filter.behavior) return false;
    if (filter.wallet && s.wallet !== filter.wallet) return false;
    if (filter.observedAtGt && s.observedAt <= filter.observedAtGt) return false;
    if (filter.observedAtGte && s.observedAt < filter.observedAtGte) return false;
    if (filter.observedAtLt && s.observedAt >= filter.observedAtLt) return false;
    if (filter.observedAtLte && s.observedAt > filter.observedAtLte) return false;
    return true;
  });
}

/** Matches `…/graphql`; only same-origin requests are mocked. */
const GRAPHQL_URL_RE = /https?:\/\/[^/]+\/graphql\/?$/;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
};

function shouldMockGraphqlRequest(request: Request): boolean {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");
    if (!path.endsWith("/graphql")) return false;
    return url.origin === self.location.origin;
  } catch {
    return false;
  }
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
  http.options(GRAPHQL_URL_RE, ({ request }) => {
    if (!shouldMockGraphqlRequest(request)) {
      return passthrough();
    }
    return new HttpResponse(null, { status: 204, headers: corsHeaders });
  }),

  http.post(GRAPHQL_URL_RE, async ({ request }) => {
    if (!shouldMockGraphqlRequest(request)) {
      return passthrough();
    }

    const body = (await request.json().catch(() => null)) as {
      query?: string;
      variables?: Record<string, unknown>;
      operationName?: string | null;
    } | null;

    if (!body?.query) {
      return gqlJson({ errors: [{ message: "Invalid GraphQL body" }] });
    }

    const op = getOperationName(body);
    const variables = body.variables ?? {};

    if (op === "Sightings") {
      const limit = (variables.limit as number | undefined) ?? 100;
      const offset = (variables.offset as number | undefined) ?? 0;
      const filter = variables.filter as SightingsFilterInput | null | undefined;
      const filtered = applySightingsFilter(mockSightings, filter ?? undefined);
      const items = filtered.slice(offset, offset + limit);
      return gqlJson({
        data: {
          sightings: {
            items,
            total: filtered.length,
            hasMore: offset + limit < filtered.length,
          },
        },
      });
    }

    if (op === "SightingsByIds") {
      const ids = variables.ids as string[] | undefined;
      if (!ids?.length) {
        return gqlJson({ data: { sightingsByIds: [] } });
      }
      const idSet = new Set(ids);
      const items = mockSightings.filter((s) => idSet.has(s.id));
      return gqlJson({ data: { sightingsByIds: items } });
    }

    if (op === "Sighting") {
      const id = variables.id as string | undefined;
      if (!id) {
        return gqlJson({ errors: [{ message: "id required" }] });
      }
      const one = mockSightings.find((s) => s.id === id) ?? null;
      return gqlJson({ data: { sighting: one } });
    }

    return gqlJson({
      errors: [{ message: op ? `Unknown operation: ${op}` : "Unnamed operation" }],
    });
  }),
];
