import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import { submitSighting, rewardSighting } from "../hedera";
import { Species, Behavior, Sighting } from "../types/sighting";
import { DEFAULTS } from "../config/constants";

const createSightingSchema = {
  description: "Submit a new marine life sighting to HCS and reward observer",
  tags: ["sightings"],
  body: {
    type: "object",
    required: ["latitude", "longitude", "observedAt", "wallet"],
    properties: {
      latitude: { type: "number" },
      longitude: { type: "number" },
      species: { type: "string", enum: Object.values(Species), default: Species.WHITE_SHARK },
      count: { type: "number", default: 1 },
      behavior: { type: "string", enum: Object.values(Behavior), default: Behavior.UNKNOWN },
      observedAt: { type: "string", format: "date-time" },
      comment: { type: "string" },
      mediaUrl: { type: "string" },
      wallet: { type: "string", description: "Hedera Account ID of observer" },
    },
  },
};

interface CreateSightingBody {
  latitude: number;
  longitude: number;
  species?: Species;
  count?: number;
  behavior?: Behavior;
  observedAt: string;
  comment?: string;
  mediaUrl?: string;
  wallet: string;
}

export async function sightingsRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateSightingBody }>("/", { schema: createSightingSchema }, async (request, reply) => {
    const body = request.body;

    if (!body.wallet) {
      return reply.badRequest("wallet is required");
    }

    if (!body.latitude || !body.longitude) {
      return reply.badRequest("latitude and longitude are required");
    }

    if (!body.observedAt) {
      return reply.badRequest("observedAt is required");
    }

    const sighting: Sighting = {
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
      wallet: body.wallet,
    };

    const hcsResult = await submitSighting(sighting);

    let reward = null;
    try {
      reward = await rewardSighting(body.wallet);
    } catch (err) {
      app.log.warn({ err, wallet: body.wallet }, "Failed to reward sighting, token not associated?");
    }

    return reply.code(201).send({
      sighting,
      sequenceNumber: hcsResult.sequenceNumber,
      reward,
    });
  });
}
