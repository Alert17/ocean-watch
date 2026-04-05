import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  base64StringToSignatureMap,
  extractFirstSignature,
} from "@hashgraph/hedera-wallet-connect";
import { requestChallenge, verifySignature, type ApiUser } from "../lib/api";
import { getHederaConnector } from "../lib/hederaWallet";

// ── Storage keys ─────────────────────────────────────────────────────────
const KEYS = {
  jwt: "ow_jwt",
  wallet: "ow_wallet",
  name: "ow_name",
  worldIdVerified: "ow_world_id_verified",
} as const;

const HEDERA_NETWORK = (import.meta.env.VITE_HEDERA_NETWORK as string) || "testnet";

// ── Context shape ────────────────────────────────────────────────────────
export interface WalletAuthState {
  // Wallet connect state
  isInitializing: boolean;
  connectedAccountId: string | null;

  // Auth state (after challenge-sign-verify)
  jwt: string | null;
  wallet: string | null;
  name: string | null;
  user: ApiUser | null;
  isWorldIdVerified: boolean;
  isReady: boolean;

  // Actions
  connectAndAuth: () => Promise<void>;
  disconnect: () => Promise<void>;
  setWorldIdVerified: () => void;

  // Aliases for backward compat with useAuth consumers
  logout: () => Promise<void>;
}

const WalletAuthContext = createContext<WalletAuthState | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────
export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const connectorRef = useRef<Awaited<ReturnType<typeof getHederaConnector>> | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

  const [jwt, setJwt] = useState<string | null>(() => localStorage.getItem(KEYS.jwt));
  const [wallet, setWallet] = useState<string | null>(() => localStorage.getItem(KEYS.wallet));
  const [name, setName] = useState<string | null>(() => localStorage.getItem(KEYS.name));
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isWorldIdVerified, setIsWorldIdVerifiedState] = useState(
    () => localStorage.getItem(KEYS.worldIdVerified) === "true",
  );

  // ── Initialize DAppConnector via the shared hederaWallet singleton ─────
  // getHederaConnector() validates PROJECT_ID, checks walletConnectClient
  // after init, and resets on failure — safe to call from StrictMode.
  useEffect(() => {
    let cancelled = false;

    getHederaConnector()
      .then((connector) => {
        if (cancelled) return;
        connectorRef.current = connector;

        // Restore existing session if available
        if (connector.signers.length > 0) {
          const accountId = connector.signers[0].getAccountId().toString();
          setConnectedAccountId(accountId);
        }
      })
      .catch((err) => {
        console.error("[wallet] DAppConnector init failed:", err);
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });

    return () => { cancelled = true; };
  }, []);

  // ── Connect wallet + challenge-sign-verify in one flow ─────────────────
  const connectAndAuth = useCallback(async () => {
    const connector = connectorRef.current;
    if (!connector) throw new Error("Wallet SDK not ready");

    // 1. Reuse existing session if already connected; otherwise open the modal.
    let accountId: string;
    if (connector.signers.length > 0) {
      accountId = connector.signers[0].getAccountId().toString();
    } else {
      const session = await connector.openModal();
      const accounts = Object.values(session.namespaces)
        .flatMap((ns) => ns.accounts ?? []);
      const firstAccount = accounts[0];
      if (!firstAccount) throw new Error("No account returned from wallet");
      const parts = firstAccount.split(":");
      accountId = parts[parts.length - 1]; // "0.0.12345"
    }
    setConnectedAccountId(accountId);

    // 2. Request challenge from backend
    const challenge = await requestChallenge(accountId);

    // 3. Sign the message with the connected wallet
    const signerAccountId = `hedera:${HEDERA_NETWORK}:${accountId}`;
    const signResult = await connector.signMessage({
      signerAccountId,
      message: challenge.message,
    });

    // 4. Extract raw signature bytes from the signatureMap.
    // The connector's `signMessage` unwraps the JSON-RPC envelope and returns
    // the `{ signatureMap }` shape directly, but the library's TS types still
    // describe the wrapped `{ result: { signatureMap } }` form. Cast to reach
    // the runtime field without blocking tsc.
    const signatureMapBase64 = (signResult as unknown as { signatureMap: string }).signatureMap;
    const signatureMap = base64StringToSignatureMap(signatureMapBase64);
    const signatureBytes = extractFirstSignature(signatureMap);

    // Convert to hex string for the backend
    const signatureHex = Array.from(signatureBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 5. Verify with backend to get JWT
    const authResponse = await verifySignature({
      wallet: accountId,
      nonce: challenge.nonce,
      signature: signatureHex,
    });

    // 6. Store auth state
    localStorage.setItem(KEYS.jwt, authResponse.token);
    localStorage.setItem(KEYS.wallet, authResponse.user.wallet);
    localStorage.setItem(KEYS.name, authResponse.user.name ?? accountId);
    setJwt(authResponse.token);
    setWallet(authResponse.user.wallet);
    setName(authResponse.user.name ?? accountId);
    setUser(authResponse.user);

    // Check if already World ID verified
    if (authResponse.user.worldIdVerified) {
      localStorage.setItem(KEYS.worldIdVerified, "true");
      setIsWorldIdVerifiedState(true);
    }
  }, []);

  // ── Disconnect ─────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    const connector = connectorRef.current;
    if (connector) {
      try {
        await connector.disconnectAll();
      } catch {
        // ignore disconnect errors
      }
    }

    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setJwt(null);
    setWallet(null);
    setName(null);
    setUser(null);
    setConnectedAccountId(null);
    setIsWorldIdVerifiedState(false);
  }, []);

  // ── World ID ───────────────────────────────────────────────────────────
  const setWorldIdVerified = useCallback(() => {
    localStorage.setItem(KEYS.worldIdVerified, "true");
    setIsWorldIdVerifiedState(true);
  }, []);

  const value: WalletAuthState = {
    isInitializing,
    connectedAccountId,
    jwt,
    wallet,
    name,
    user,
    isWorldIdVerified,
    isReady: !!jwt && isWorldIdVerified,
    connectAndAuth,
    disconnect,
    setWorldIdVerified,
    logout: disconnect,
  };

  return (
    <WalletAuthContext.Provider value={value}>
      {children}
    </WalletAuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────
export function useWalletAuth(): WalletAuthState {
  const ctx = useContext(WalletAuthContext);
  if (!ctx) throw new Error("useWalletAuth must be used within WalletAuthProvider");
  return ctx;
}
