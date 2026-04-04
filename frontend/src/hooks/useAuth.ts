import { useState } from "react";

const KEYS = {
  jwt: "ow_jwt",
  wallet: "ow_wallet",
  name: "ow_name",
  worldIdVerified: "ow_world_id_verified",
} as const;

/** Persists a Hedera account ID obtained via WalletConnect (before API auth). */
export function persistConnectedHederaAccount(accountId: string): void {
  localStorage.setItem(KEYS.wallet, accountId);
}

export type AuthState = {
  jwt: string | null;
  wallet: string | null;
  name: string | null;
  isWorldIdVerified: boolean;
  /** True when the user has a JWT AND has verified their World ID. */
  isReady: boolean;
  setAuth: (jwt: string, wallet: string, name: string) => void;
  setWorldIdVerified: () => void;
  logout: () => void;
};

export function useAuth(): AuthState {
  const [jwt, setJwt] = useState<string | null>(
    () => localStorage.getItem(KEYS.jwt),
  );
  const [wallet, setWallet] = useState<string | null>(
    () => localStorage.getItem(KEYS.wallet),
  );
  const [name, setName] = useState<string | null>(
    () => localStorage.getItem(KEYS.name),
  );
  const [isWorldIdVerified, setIsWorldIdVerified] = useState<boolean>(
    () => localStorage.getItem(KEYS.worldIdVerified) === "true",
  );

  const setAuth = (newJwt: string, newWallet: string, newName: string) => {
    localStorage.setItem(KEYS.jwt, newJwt);
    localStorage.setItem(KEYS.wallet, newWallet);
    localStorage.setItem(KEYS.name, newName);
    setJwt(newJwt);
    setWallet(newWallet);
    setName(newName);
  };

  const setWorldIdVerified = () => {
    localStorage.setItem(KEYS.worldIdVerified, "true");
    setIsWorldIdVerified(true);
  };

  const logout = () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setJwt(null);
    setWallet(null);
    setName(null);
    setIsWorldIdVerified(false);
  };

  return {
    jwt,
    wallet,
    name,
    isWorldIdVerified,
    isReady: !!jwt && isWorldIdVerified,
    setAuth,
    setWorldIdVerified,
    logout,
  };
}
