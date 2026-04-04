import "dotenv/config";
import {
  Client,
  AccountId,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
} from "@hashgraph/sdk";

async function main() {
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID!);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY!);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);

  // Create Treasury account
  const treasuryKey = PrivateKey.generateECDSA();
  const treasuryTx = await new AccountCreateTransaction()
    .setKey(treasuryKey.publicKey)
    .setInitialBalance(new Hbar(1))
    .setAccountMemo("OceanWatch Treasury")
    .execute(client);

  const treasuryReceipt = await treasuryTx.getReceipt(client);
  console.log(`Treasury account: ${treasuryReceipt.accountId}`);
  console.log(`Treasury private key: ${treasuryKey.toStringRaw()}`);

  // Create Platform account
  const platformKey = PrivateKey.generateECDSA();
  const platformTx = await new AccountCreateTransaction()
    .setKey(platformKey.publicKey)
    .setInitialBalance(new Hbar(1))
    .setAccountMemo("OceanWatch Platform")
    .execute(client);

  const platformReceipt = await platformTx.getReceipt(client);
  console.log(`Platform account: ${platformReceipt.accountId}`);
  console.log(`Platform private key: ${platformKey.toStringRaw()}`);

  console.log("\nAdd to .env:");
  console.log(`HEDERA_TREASURY_ACCOUNT_ID=${treasuryReceipt.accountId}`);
  console.log(`HEDERA_TREASURY_KEY=${treasuryKey.toStringRaw()}`);
  console.log(`HEDERA_PLATFORM_ACCOUNT_ID=${platformReceipt.accountId}`);

  client.close();
}

main().catch(console.error);
