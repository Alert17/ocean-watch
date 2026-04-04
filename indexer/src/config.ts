import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3002,
  hedera: {
    topicId: required("HEDERA_TOPIC_ID"),
    mirrorNodeUrl: process.env.HEDERA_MIRROR_NODE_URL || "https://testnet.mirrornode.hedera.com",
  },
} as const;
