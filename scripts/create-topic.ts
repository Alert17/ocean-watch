import "dotenv/config";
import {
  Client,
  AccountId,
  PrivateKey,
  TopicCreateTransaction,
} from "@hashgraph/sdk";

async function main() {
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY!);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  const tx = await new TopicCreateTransaction()
    .setTopicMemo("OceanWatch Sightings")
    .setSubmitKey(operatorKey.publicKey)
    .execute(client);

  const receipt = await tx.getReceipt(client);

  console.log(`Topic created: ${receipt.topicId}`);
  console.log(`Add to .env: HEDERA_TOPIC_ID=${receipt.topicId}`);

  client.close();
}

main().catch(console.error);
