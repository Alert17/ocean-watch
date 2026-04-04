import { FastifyInstance } from "fastify";
import {
  getTokenPrice,
  getContributorBalance,
  processDonation,
  processRedeem,
} from "../hedera";
import { authenticate } from "../plugins/authenticate";

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
      params: {
        type: "object",
        properties: {
          accountId: { type: "string", pattern: "^0\\.0\\.\\d+$" },
        },
      },
    },
  }, async (request) => {
    const balance = await getContributorBalance(request.params.accountId);
    return { accountId: request.params.accountId, balance };
  });

  app.post<{ Body: { donorAccountId: string; amountHbar: number } }>("/donate", {
    schema: {
      description: "Donate HBAR to treasury (80% redeemable, 20% platform)",
      tags: ["token"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["donorAccountId", "amountHbar"],
        properties: {
          donorAccountId: { type: "string", pattern: "^0\\.0\\.\\d+$" },
          amountHbar: { type: "number", exclusiveMinimum: 0, maximum: 1_000_000 },
        },
      },
    },
    onRequest: [authenticate],
  }, async (request, reply) => {
    const { donorAccountId, amountHbar } = request.body;
    const result = await processDonation(donorAccountId, amountHbar);
    return result;
  });

  app.post<{ Body: { userAccountId: string; tokenAmount: number } }>("/redeem", {
    schema: {
      description: "Redeem OCEAN tokens for HBAR share of treasury",
      tags: ["token"],
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        required: ["userAccountId", "tokenAmount"],
        properties: {
          userAccountId: { type: "string", pattern: "^0\\.0\\.\\d+$" },
          tokenAmount: { type: "number", exclusiveMinimum: 0, maximum: 1_000_000 },
        },
      },
    },
    onRequest: [authenticate],
  }, async (request, reply) => {
    const { userAccountId, tokenAmount } = request.body;
    const result = await processRedeem(userAccountId, tokenAmount);
    return result;
  });
}
