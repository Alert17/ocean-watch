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

  hedera: {
    operatorId: required("HEDERA_OPERATOR_ID"),
    operatorKey: required("HEDERA_OPERATOR_KEY"),
    topicId: required("HEDERA_TOPIC_ID"),
  },
} as const;
