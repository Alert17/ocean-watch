import { FastifyInstance } from "fastify";
import { ChallengeBody, VerifySignatureBody } from "../types/auth";
import { findUserByWallet, createUser, createChallenge, verifyChallenge } from "../services/auth.service";
import { challengeResponse, verifyAuthResponse } from "../schemas/responses";

const challengeSchema = {
  description: "Request a challenge nonce for wallet verification",
  tags: ["auth"],
  response: challengeResponse,
  body: {
    type: "object",
    required: ["wallet"],
    properties: {
      wallet: { type: "string", pattern: "^0\\.0\\.\\d+$", description: "Hedera Account ID (0.0.xxx)" },
    },
  },
};

const verifySchema = {
  description: "Verify signed challenge and register/login",
  tags: ["auth"],
  response: verifyAuthResponse,
  body: {
    type: "object",
    required: ["wallet", "nonce", "signature"],
    properties: {
      wallet: { type: "string", pattern: "^0\\.0\\.\\d+$", description: "Hedera Account ID (0.0.xxx)" },
      nonce: { type: "string", minLength: 64, maxLength: 64 },
      signature: { type: "string", pattern: "^[0-9a-fA-F]+$", description: "Hex-encoded signature" },
      name: { type: "string", maxLength: 100 },
    },
  },
};

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: ChallengeBody }>("/challenge", { schema: challengeSchema }, async (request, reply) => {
    const { wallet } = request.body;

    const challenge = await createChallenge(wallet);

    return reply.send(challenge);
  });

  app.post<{ Body: VerifySignatureBody }>("/verify", { schema: verifySchema }, async (request, reply) => {
    const { wallet, nonce, signature, name } = request.body;

    const result = await verifyChallenge(wallet, nonce, signature);
    if (!result.valid) {
      return reply.unauthorized("Invalid signature or expired challenge");
    }

    // Register or login
    let user = await findUserByWallet(wallet);
    if (!user) {
      user = await createUser(wallet, name, result.publicKeyStr);
    }

    const token = app.jwt.sign({ sub: user.id, wallet: user.wallet });

    return reply.send({ user, token });
  });
}
