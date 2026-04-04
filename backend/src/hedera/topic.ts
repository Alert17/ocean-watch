import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { client, topicId } from "./client";
import { Sighting } from "../types/sighting";
import { withRetry } from "./retry";

export async function submitSighting(sighting: Sighting) {
  return withRetry(async () => {
    const tx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(sighting))
      .setTransactionMemo(`sighting:${sighting.id}`)
      .execute(client);

    const receipt = await tx.getReceipt(client);

    return {
      sequenceNumber: receipt.topicSequenceNumber?.toString(),
    };
  }, "submitSighting");
}
