import {
  Client,
  AccountId,
  PrivateKey,
  TopicId,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { config } from "../config";
import { Sighting } from "../types/sighting";

const operatorId = AccountId.fromString(config.hedera.operatorId);
const operatorKey = PrivateKey.fromStringDer(config.hedera.operatorKey);
const topicId = TopicId.fromString(config.hedera.topicId);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

export async function submitSighting(sighting: Sighting) {
  const tx = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(sighting))
    .execute(client);

  const receipt = await tx.getReceipt(client);

  return {
    sequenceNumber: receipt.topicSequenceNumber?.toString(),
  };
}
