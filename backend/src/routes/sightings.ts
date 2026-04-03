import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import { submitSighting } from "../services/hedera";
import { Species, Behavior, Sighting } from "../types/sighting";
import { DEFAULTS } from "../config/constants";

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
  app.post<{ Body: CreateSightingBody }>("/", async (request, reply) => {
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

    const result = await submitSighting(sighting);

    return reply.code(201).send({
      sighting,
      sequenceNumber: result.sequenceNumber,
    });
  });
}
