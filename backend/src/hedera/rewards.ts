import {
  TokenMintTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  AccountId,
} from "@hashgraph/sdk";
import { client, operatorId, tokenId } from "./client";
import { SightingReward } from "./types";

const REWARD_AMOUNT = 10_00; // 10.00 OCEAN (decimals = 2)
const DECIMALS = 100;

export async function rewardSighting(userAccountId: string): Promise<SightingReward> {
  // 1. Mint tokens to treasury
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(REWARD_AMOUNT)
    .execute(client);

  await mintTx.getReceipt(client);

  // 2. Transfer from treasury to user
  const user = AccountId.fromString(userAccountId);

  const transferTx = await new TransferTransaction()
    .addTokenTransfer(tokenId, operatorId, -REWARD_AMOUNT)
    .addTokenTransfer(tokenId, user, REWARD_AMOUNT)
    .execute(client);

  await transferTx.getReceipt(client);

  return {
    tokensMinted: REWARD_AMOUNT / DECIMALS,
    recipientAccount: userAccountId,
    transactionId: transferTx.transactionId.toString(),
  };
}

export async function getContributorBalance(userAccountId: string): Promise<number> {
  const balance = await new AccountBalanceQuery()
    .setAccountId(AccountId.fromString(userAccountId))
    .execute(client);

  const tokenBalance = balance.tokens?.get(tokenId);
  return tokenBalance ? Number(tokenBalance) / DECIMALS : 0;
}
