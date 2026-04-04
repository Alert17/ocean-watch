import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { client, topicId } from "./client";
import { Sighting } from "../types/sighting";

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
