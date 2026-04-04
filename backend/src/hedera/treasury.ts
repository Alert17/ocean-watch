import {
  AccountBalanceQuery,
  TransferTransaction,
  TokenBurnTransaction,
  TokenInfoQuery,
  AccountId,
  Hbar,
} from "@hashgraph/sdk";
import { client, operatorId, tokenId, treasuryAccountId, treasuryKey, platformAccountId } from "./client";
import { TokenPriceInfo, DonationResult, RedeemResult } from "./types";
import { TOKEN_DECIMALS, PLATFORM_FEE_PERCENT, TREASURY_PERCENT } from "../config/constants";

export async function getTreasuryBalance(): Promise<number> {
  const balance = await new AccountBalanceQuery()
    .setAccountId(treasuryAccountId)
    .execute(client);

  return balance.hbars.toBigNumber().toNumber();
}

export async function getCirculatingSupply(): Promise<number> {
  const info = await new TokenInfoQuery()
    .setTokenId(tokenId)
    .execute(client);

  return Number(info.totalSupply) / TOKEN_DECIMALS;
}

const PRICE_CACHE_TTL_MS = 30_000; // 30 seconds
let priceCache: { data: TokenPriceInfo; ts: number } | null = null;

export async function getTokenPrice(): Promise<TokenPriceInfo> {
  if (priceCache && Date.now() - priceCache.ts < PRICE_CACHE_TTL_MS) {
    return priceCache.data;
  }

  const treasuryBalanceHbar = await getTreasuryBalance();
  const circulatingSupply = await getCirculatingSupply();

  const pricePerToken = circulatingSupply > 0
    ? treasuryBalanceHbar / circulatingSupply
    : 0;

  const data = { treasuryBalanceHbar, circulatingSupply, pricePerToken };
  priceCache = { data, ts: Date.now() };

  return data;
}

export async function processDonation(
  donorAccountId: string,
  amountHbar: number,
): Promise<DonationResult> {
  const donor = AccountId.fromString(donorAccountId);
  const treasuryAmount = (amountHbar * TREASURY_PERCENT) / 100;
  const platformAmount = (amountHbar * PLATFORM_FEE_PERCENT) / 100;

  const tx = await new TransferTransaction()
    .addHbarTransfer(donor, new Hbar(-amountHbar))
    .addHbarTransfer(treasuryAccountId, new Hbar(treasuryAmount))
    .addHbarTransfer(platformAccountId, new Hbar(platformAmount))
    .execute(client);

  await tx.getReceipt(client);

  return {
    totalHbar: amountHbar,
    treasuryHbar: treasuryAmount,
    platformHbar: platformAmount,
    transactionId: tx.transactionId.toString(),
  };
}

export async function processRedeem(
  userAccountId: string,
  tokenAmount: number,
): Promise<RedeemResult> {
  const user = AccountId.fromString(userAccountId);
  const rawAmount = Math.round(tokenAmount * TOKEN_DECIMALS);

  const circulatingSupply = await getCirculatingSupply();
  if (circulatingSupply <= 0) {
    throw new Error("No tokens in circulation, cannot redeem");
  }

  const treasuryBalance = await getTreasuryBalance();
  if (treasuryBalance <= 0) {
    throw new Error("Treasury is empty, cannot redeem");
  }

  const hbarShareRaw = (tokenAmount / circulatingSupply) * treasuryBalance;
  const hbarShare = Math.floor(hbarShareRaw * 1e8) / 1e8; // round down to tinybars

  if (hbarShare <= 0) {
    throw new Error("Redemption amount too small");
  }

  // 1. Transfer tokens from user to operator (for burning)
  const transferTx = await new TransferTransaction()
    .addTokenTransfer(tokenId, user, -rawAmount)
    .addTokenTransfer(tokenId, operatorId, rawAmount)
    .execute(client);

  await transferTx.getReceipt(client);

  // 2. Burn tokens (operator is supplyKey)
  const burnTx = await new TokenBurnTransaction()
    .setTokenId(tokenId)
    .setAmount(rawAmount)
    .execute(client);

  await burnTx.getReceipt(client);

  // 3. Send HBAR from treasury to user
  const hbarTx = new TransferTransaction()
    .addHbarTransfer(treasuryAccountId, new Hbar(-hbarShare))
    .addHbarTransfer(user, new Hbar(hbarShare))
    .freezeWith(client);

  const signedTx = await (await hbarTx).sign(treasuryKey);
  const hbarTxSubmit = await signedTx.execute(client);

  await hbarTxSubmit.getReceipt(client);

  const newPrice = await getTokenPrice();

  return {
    hbarAmount: hbarShare,
    tokensBurned: tokenAmount,
    newTokenPrice: newPrice.pricePerToken,
    transactionId: hbarTxSubmit.transactionId.toString(),
  };
}
