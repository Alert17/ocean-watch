import {
  TokenMintTransaction,
  TokenBurnTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  AccountId,
} from "@hashgraph/sdk";
import { client, operatorId, tokenId } from "./client";
import { SightingReward } from "./types";
import { REWARD_AMOUNT, TOKEN_DECIMALS } from "../config/constants";
import { prisma } from "../db";
import { withRetry } from "./retry";

export async function isTokenAssociated(accountIdOrString: AccountId | string): Promise<boolean> {
  const accountId = typeof accountIdOrString === "string" ? AccountId.fromString(accountIdOrString) : accountIdOrString;
  const balance = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(client);

  return balance.tokens?.get(tokenId) !== undefined;
}

export async function rewardSighting(userAccountId: string, sightingId: string): Promise<SightingReward> {
  // Idempotency: check DB for existing reward
  const existing = await prisma.reward.findUnique({ where: { sightingId } });
  if (existing) {
    throw new Error(`Sighting ${sightingId} already rewarded`);
  }

  const user = AccountId.fromString(userAccountId);

  // 0. Check token association
  const associated = await isTokenAssociated(user);
  if (!associated) {
    throw new Error(`Token not associated for account ${userAccountId}`);
  }

  // 1. Mint tokens to treasury
  await withRetry(async () => {
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(REWARD_AMOUNT)
      .setTransactionMemo(`mint:${sightingId}`)
      .execute(client);
    await mintTx.getReceipt(client);
  }, "mintReward");

  // 2. Transfer from treasury to user — rollback mint if transfer fails
  let transferTxId: string;
  try {
    transferTxId = await withRetry(async () => {
      const tx = await new TransferTransaction()
        .addTokenTransfer(tokenId, operatorId, -REWARD_AMOUNT)
        .addTokenTransfer(tokenId, user, REWARD_AMOUNT)
        .setTransactionMemo(`reward:${sightingId}`)
        .execute(client);
      await tx.getReceipt(client);
      return tx.transactionId.toString();
    }, "transferReward");
  } catch (err) {
    // Rollback: burn minted tokens to keep supply consistent
    try {
      const burnTx = await new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setAmount(REWARD_AMOUNT)
        .execute(client);
      await burnTx.getReceipt(client);
    } catch {
      // Burn failed — supply is inconsistent, needs manual intervention
    }
    throw err;
  }

  // 3. Record reward in DB for idempotency
  await prisma.reward.create({
    data: {
      sightingId,
      wallet: userAccountId,
      amount: REWARD_AMOUNT,
      transactionId: transferTxId,
    },
  });

  return {
    tokensMinted: REWARD_AMOUNT / TOKEN_DECIMALS,
    recipientAccount: userAccountId,
    transactionId: transferTxId,
  };
}

export async function getContributorBalance(userAccountId: string): Promise<number> {
  const balance = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(userAccountId))
    .execute(client);

  const tokenBalance = balance.tokens?.get(tokenId);
  return tokenBalance ? Number(tokenBalance) / TOKEN_DECIMALS : 0;
}
