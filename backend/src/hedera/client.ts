import {
  Client,
  AccountId,
  PrivateKey,
  TopicId,
  TokenId,
} from "@hashgraph/sdk";
import { config } from "../config";

export const operatorId = AccountId.fromString(config.hedera.operatorId);
export const operatorKey = PrivateKey.fromStringECDSA(config.hedera.operatorKey);
export const topicId = TopicId.fromString(config.hedera.topicId);
export const tokenId = TokenId.fromString(config.hedera.tokenId);
export const platformAccountId = AccountId.fromString(config.hedera.platformAccountId);

export const client = Client.forTestnet().setOperator(operatorId, operatorKey);
