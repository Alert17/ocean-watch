import { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { Species, Behavior, CreateSightingBody } from "../types/sighting";
import { authenticate } from "../plugins/authenticate";
import { createSighting } from "../services/sighting.service";
import { SIGHTING_RATE_LIMIT_MAX, SIGHTING_RATE_LIMIT_WINDOW } from "../config/constants";
import { createSightingResponse } from "../schemas/responses";

const createSightingSchema = {
  description: "Submit a new marine life sighting to HCS and reward observer",
  tags: ["sightings"],
  security: [{ bearerAuth: [] }],
  response: createSightingResponse,
  body: {
    type: "object",
    required: ["latitude", "longitude", "observedAt"],
    properties: {
      latitude: { type: "number", minimum: -90, maximum: 90 },
      longitude: { type: "number", minimum: -180, maximum: 180 },
      species: { type: "string", enum: Object.values(Species), default: Species.WHITE_SHARK },
      count: { type: "integer", minimum: 1, maximum: 1000, default: 1 },
      behavior: { type: "string", enum: Object.values(Behavior), default: Behavior.UNKNOWN },
      observedAt: { type: "string", format: "date-time" },
      comment: { type: "string", maxLength: 2000 },
      mediaUrl: { type: "string", format: "uri" },
    },
  },
};

export async function sightingsRoutes(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: SIGHTING_RATE_LIMIT_MAX,
    timeWindow: SIGHTING_RATE_LIMIT_WINDOW,
    keyGenerator: (request) => request.user?.wallet ?? request.ip,
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Max ${SIGHTING_RATE_LIMIT_MAX} sightings per ${SIGHTING_RATE_LIMIT_WINDOW}`,
    }),
  });

  app.post<{ Body: CreateSightingBody }>("/", { schema: createSightingSchema, onRequest: [authenticate] }, async (request, reply) => {
    const result = await createSighting(request.body, request.user.wallet);

    if (result.rewardError) {
      app.log.warn({ wallet: request.user.wallet, error: result.rewardError }, "Failed to reward sighting");
    }

    return reply.code(201).send(result);
  });
}
