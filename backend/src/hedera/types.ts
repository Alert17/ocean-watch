export interface TokenPriceInfo {
  treasuryBalanceHbar: number;
  circulatingSupply: number;
  pricePerToken: number;
}

export interface RedeemResult {
  hbarAmount: number;
  tokensBurned: number;
  newTokenPrice: number;
  transactionId: string;
}

export interface DonationResult {
  totalHbar: number;
  treasuryHbar: number;
  platformHbar: number;
  transactionId: string;
}

export interface SightingReward {
  tokensMinted: number;
  recipientAccount: string;
  transactionId: string;
}
