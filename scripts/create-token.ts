import "dotenv/config";
import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
} from "@hashgraph/sdk";

async function main() {
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY!);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  const tx = await new TokenCreateTransaction()
    .setTokenName("OceanWatch Token")
    .setTokenSymbol("OCEAN")
    .setTokenType(TokenType.FungibleCommon)
    .setDecimals(2)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(operatorKey.publicKey)
    .setSupplyKey(operatorKey.publicKey)
    .setKycKey(operatorKey.publicKey)
    .execute(client);

  const receipt = await tx.getReceipt(client);

  console.log(`Token created: ${receipt.tokenId}`);
  console.log(`Add to .env: HEDERA_TOKEN_ID=${receipt.tokenId}`);

  client.close();
}

main().catch(console.error);
