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

/** Track rewarded sighting IDs to prevent double-rewards on retries */
const rewardedSightings = new Set<string>();

async function isTokenAssociated(accountId: AccountId): Promise<boolean> {
  const balance = await new AccountBalanceQuery()
    .setAccountId(accountId)
    .execute(client);

  return balance.tokens?.get(tokenId) !== null;
}

export async function rewardSighting(userAccountId: string, sightingId: string): Promise<SightingReward> {
  // Idempotency: skip if already rewarded
  if (rewardedSightings.has(sightingId)) {
    throw new Error(`Sighting ${sightingId} already rewarded`);
  }

  const user = AccountId.fromString(userAccountId);

  // 0. Check token association
  const associated = await isTokenAssociated(user);
  if (!associated) {
    throw new Error(`Token not associated for account ${userAccountId}`);
  }

  // 1. Mint tokens to treasury
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(REWARD_AMOUNT)
    .setTransactionMemo(`mint:${sightingId}`)
    .execute(client);

  await mintTx.getReceipt(client);

  // 2. Transfer from treasury to user — rollback mint if transfer fails
  let transferTx;
  try {
    transferTx = await new TransferTransaction()
      .addTokenTransfer(tokenId, operatorId, -REWARD_AMOUNT)
      .addTokenTransfer(tokenId, user, REWARD_AMOUNT)
      .setTransactionMemo(`reward:${sightingId}`)
      .execute(client);

    await transferTx.getReceipt(client);
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

  rewardedSightings.add(sightingId);

  return {
    tokensMinted: REWARD_AMOUNT / TOKEN_DECIMALS,
    recipientAccount: userAccountId,
    transactionId: transferTx.transactionId.toString(),
  };
}

export async function getContributorBalance(userAccountId: string): Promise<number> {
  const balance = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(userAccountId))
    .execute(client);

  const tokenBalance = balance.tokens?.get(tokenId);
  return tokenBalance ? Number(tokenBalance) / TOKEN_DECIMALS : 0;
}
