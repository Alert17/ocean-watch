import { PrivateKey, PublicKey } from "@hashgraph/sdk";

const key = PrivateKey.fromStringECDSA("0x76e0a77a6634ed9850f7de763ce8138644403c42db1bda517461e5b496f703bc");
const pubKey = key.publicKey;
console.log("Public key raw:", pubKey.toStringRaw());

const msg = new Uint8Array(Buffer.from("test message", "utf-8"));
const sig = key.sign(msg);
console.log("Sig length:", sig.length, "Sig hex:", Buffer.from(sig).toString("hex").substring(0, 40) + "...");
console.log("Verify own sig:", pubKey.verify(msg, sig));

// Check mirror node
const res = await fetch("https://testnet.mirrornode.hedera.com/api/v1/accounts/0.0.8499986");
const data = await res.json() as any;
console.log("Mirror key:", JSON.stringify(data.key));

// Now try to verify using the mirror node key
const mirrorPub = PublicKey.fromStringECDSA(data.key.key);
console.log("Mirror pub verify:", mirrorPub.verify(msg, sig));
console.log("Keys match:", pubKey.toStringRaw() === data.key.key);
