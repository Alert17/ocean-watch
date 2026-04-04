import { http, HttpResponse, passthrough } from "msw";
import { parse, type OperationDefinitionNode } from "graphql";
import type { Sighting } from "../graphql/types";
import { initialMockSightings } from "./data";

let mockSightings: Sighting[] = initialMockSightings();

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
      return gqlJson({ data: { sightings: mockSightings } });
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
