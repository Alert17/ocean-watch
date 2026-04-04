import { FastifyInstance } from "fastify";
import {
  getTokenPrice,
  getContributorBalance,
  processDonation,
  processRedeem,
} from "../hedera";

export async function tokenRoutes(app: FastifyInstance) {
  app.get("/price", {
    schema: {
      description: "Get current OCEAN token price (treasury balance / supply)",
      tags: ["token"],
    },
  }, async () => {
    return getTokenPrice();
  });

  app.get<{ Params: { accountId: string } }>("/:accountId/balance", {
    schema: {
      description: "Get OCEAN balance for an account",
      tags: ["token"],
    },
  }, async (request) => {
    const balance = await getContributorBalance(request.params.accountId);
    return { accountId: request.params.accountId, balance };
  });

  app.post<{ Body: { donorAccountId: string; amountHbar: number } }>("/donate", {
    schema: {
      description: "Donate HBAR to treasury (80% redeemable, 20% platform)",
      tags: ["token"],
      body: {
        type: "object",
        required: ["donorAccountId", "amountHbar"],
        properties: {
          donorAccountId: { type: "string" },
          amountHbar: { type: "number" },
        },
      },
    },
  }, async (request, reply) => {
    const { donorAccountId, amountHbar } = request.body;

    if (amountHbar <= 0) {
      return reply.badRequest("amountHbar must be positive");
    }

    const result = await processDonation(donorAccountId, amountHbar);
    return result;
  });

  app.post<{ Body: { userAccountId: string; tokenAmount: number } }>("/redeem", {
    schema: {
      description: "Redeem OCEAN tokens for HBAR share of treasury",
      tags: ["token"],
      body: {
        type: "object",
        required: ["userAccountId", "tokenAmount"],
        properties: {
          userAccountId: { type: "string" },
          tokenAmount: { type: "number" },
        },
      },
    },
  }, async (request, reply) => {
    const { userAccountId, tokenAmount } = request.body;

    if (tokenAmount <= 0) {
      return reply.badRequest("tokenAmount must be positive");
    }

    const result = await processRedeem(userAccountId, tokenAmount);
    return result;
  });
}
