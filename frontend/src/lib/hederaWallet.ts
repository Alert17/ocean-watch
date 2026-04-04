import { DAppConnector, HederaChainId } from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hashgraph/sdk";

let connector: DAppConnector | null = null;
let ready: Promise<DAppConnector> | null = null;

function ledgerFromEnv(): LedgerId {
  const raw = (import.meta.env.VITE_HEDERA_NETWORK as string | undefined)?.toLowerCase() ?? "testnet";
  try {
    return LedgerId.fromString(raw);
  } catch {
    return LedgerId.TESTNET;
  }
}

function chainsForLedger(ledger: LedgerId): string[] {
  switch (ledger.toString()) {
    case "mainnet":
      return [HederaChainId.Mainnet];
    case "previewnet":
      return [HederaChainId.Previewnet];
    case "devnet":
      return [HederaChainId.Devnet];
    default:
      return [HederaChainId.Testnet];
  }
}

function walletConnectProjectId(): string {
  const id = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
  if (!id?.trim()) {
    throw new Error(
      "Variable VITE_WALLETCONNECT_PROJECT_ID manquante. Créez un projet sur https://cloud.reown.com et ajoutez-la dans .env",
    );
  }
  return id.trim();
}

export async function getHederaConnector(): Promise<DAppConnector> {
  if (ready) {
    return ready;
  }

  ready = (async () => {
    const projectId = walletConnectProjectId();
    const network = ledgerFromEnv();
    const chains = chainsForLedger(network);

    if (!connector) {
      connector = new DAppConnector(
        {
          name: "Ocean Watch",
          description: "Ocean Watch",
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`],
        },
        network,
        projectId,
        undefined,
        undefined,
        chains,
        "error",
      );
    }

    await connector.init({ logger: "error" });

    if (!connector.walletConnectClient) {
      throw new Error("WalletConnect n'a pas pu s'initialiser.");
    }

    return connector;
  })();

  try {
    return await ready;
  } catch (e) {
    ready = null;
    connector = null;
    throw e;
  }
}

/**
 * Ouvre WalletConnect si besoin et renvoie l’identifiant de compte Hedera (`0.0.x`).
 */
export async function connectHederaWallet(): Promise<string> {
  const c = await getHederaConnector();

  if (c.signers.length === 0) {
    await c.openModal();
  }

  const signer = c.signers[0];
  if (!signer) {
    throw new Error("Aucun compte Hedera sélectionné.");
  }

  return signer.getAccountId().toString();
}
