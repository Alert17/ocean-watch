import { FastifyInstance } from "fastify";
import { Species, Behavior, CreateSightingBody } from "../types/sighting";
import { authenticate } from "../plugins/authenticate";
import { createSighting } from "../services/sighting.service";

const createSightingSchema = {
  description: "Submit a new marine life sighting to HCS and reward observer",
  tags: ["sightings"],
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["latitude", "longitude", "observedAt"],
    properties: {
      latitude: { type: "number" },
      longitude: { type: "number" },
      species: { type: "string", enum: Object.values(Species), default: Species.WHITE_SHARK },
      count: { type: "number", default: 1 },
      behavior: { type: "string", enum: Object.values(Behavior), default: Behavior.UNKNOWN },
      observedAt: { type: "string", format: "date-time" },
      comment: { type: "string" },
      mediaUrl: { type: "string" },
    },
  },
};

export async function sightingsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateSightingBody }>("/", { schema: createSightingSchema, onRequest: [authenticate] }, async (request, reply) => {
    const result = await createSighting(request.body, request.user.wallet);

    if (!result.reward) {
      app.log.warn({ wallet: request.user.wallet }, "Failed to reward sighting");
    }

    return reply.code(201).send(result);
  });
}
