import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: required("JWT_SECRET"),
  databaseUrl: required("DATABASE_URL"),

  worldId: {
    appId: required("WORLDID_APP_ID"),
  },

  pinata: {
    jwt: required("PINATA_JWT"),
    gateway: process.env.PINATA_GATEWAY || "gateway.pinata.cloud",
  },

  hedera: {
    operatorId: required("HEDERA_OPERATOR_ID"),
    operatorKey: required("HEDERA_OPERATOR_KEY"),
    topicId: required("HEDERA_TOPIC_ID"),
    tokenId: required("HEDERA_TOKEN_ID"),
    treasuryAccountId: required("HEDERA_TREASURY_ACCOUNT_ID"),
    treasuryKey: required("HEDERA_TREASURY_KEY"),
    platformAccountId: required("HEDERA_PLATFORM_ACCOUNT_ID"),
    mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL || "https://testnet.mirrornode.hedera.com",
  },
} as const;
