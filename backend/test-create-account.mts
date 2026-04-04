import { Client, AccountCreateTransaction, PrivateKey, Hbar } from "@hashgraph/sdk";

const operatorId = "0.0.8499986";
const operatorKey = PrivateKey.fromStringECDSA("0x76e0a77a6634ed9850f7de763ce8138644403c42db1bda517461e5b496f703bc");
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Create new ECDSA key pair for test user
const testKey = PrivateKey.generateECDSA();
console.log("Test private key:", testKey.toStringRaw());
console.log("Test public key:", testKey.publicKey.toStringRaw());

const tx = await new AccountCreateTransaction()
  .setKey(testKey.publicKey)
  .setInitialBalance(new Hbar(5))
  .execute(client);

const receipt = await tx.getReceipt(client);
console.log("Test account ID:", receipt.accountId?.toString());
