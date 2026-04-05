/**
 * MyAccount — two-step auth flow:
 *   Step 1: Connect Hedera wallet via WalletConnect (challenge-sign-verify)
 *   Step 2: World ID verification (IDKitWidget -> POST /worldid/verify)
 */

import { IDKitWidget, VerificationLevel, type ISuccessResult } from "@worldcoin/idkit";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import { mockWorldIdVerify, verifyWorldId } from "../lib/api";

const WORLD_APP_ID = (import.meta.env.VITE_WORLDID_APP_ID as string) || "app_5e00cf5d85b7fa221f91d0de558c70c3";
const WORLD_ACTION = (import.meta.env.VITE_WORLDID_ACTION as string) || "verify-human";

export function MyAccountPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Step 1 state
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, setIsAuthPending] = useState(false);

  // Step 2 state
  const [worldIdError, setWorldIdError] = useState<string | null>(null);

  // ── Step 1: Connect wallet + challenge-sign-verify ─────────────────────
  const handleConnectAndAuth = async () => {
    setAuthError(null);
    setIsAuthPending(true);
    try {
      await auth.connectAndAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      // Don't show error if user simply closed the modal
      if (!message.includes("User rejected") && !message.includes("dismissed")) {
        setAuthError(message);
      }
    } finally {
      setIsAuthPending(false);
    }
  };

  // ── Step 2: World ID ───────────────────────────────────────────────────
  const handleWorldIdVerify = async (result: ISuccessResult) => {
    if (!auth.jwt) throw new Error("JWT missing - reconnect your wallet.");
    setWorldIdError(null);

    const data = await verifyWorldId(
      {
        proof: result.proof,
        merkle_root: result.merkle_root,
        nullifier_hash: result.nullifier_hash,
        verification_level: result.verification_level,
      },
      auth.jwt,
    );

    if (!data.verified) {
      throw new Error("World ID verification failed.");
    }
  };

  const onWorldIdSuccess = () => {
    auth.setWorldIdVerified();
    navigate("/report");
  };

  const onWorldIdError = () => {
    setWorldIdError("World ID verification failed. Please try again.");
  };

  // Dev-only: call backend mock endpoint so the server-side `worldIdVerified`
  // flag is set too (otherwise sighting submissions will be rejected with 403).
  const handleMockWorldId = async () => {
    if (!auth.jwt) return;
    setWorldIdError(null);
    try {
      await mockWorldIdVerify(auth.jwt);
      onWorldIdSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mock verify failed";
      setWorldIdError(message);
    }
  };

  // ── Fully authenticated view ───────────────────────────────────────────
  if (auth.isReady) {
    return (
      <Layout title="My Account">
        <div className="mt-4 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-reef-500/30 bg-reef-500/10 px-4 py-3">
            <WorldIdOrb className="h-8 w-8 shrink-0 text-reef-300" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foam">
                {auth.name} — World ID verified
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500 break-all">
                {auth.wallet}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void auth.logout()}
            className="w-full rounded-2xl border border-slate-700 bg-abyss-850 py-3 text-sm font-medium text-slate-400 transition hover:border-coral-500/40 hover:text-coral-300"
          >
            Disconnect
          </button>
        </div>
      </Layout>
    );
  }

  // ── Step 2: World ID verification (wallet connected, not yet verified) ─
  if (auth.jwt) {
    return (
      <Layout title="Verification">
        <div className="mt-6 flex flex-col items-center gap-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-lagoon-500/20 bg-abyss-800/80 shadow-glow">
            <WorldIdOrb className="h-12 w-12 text-lagoon-400" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="font-display text-2xl font-semibold text-foam">
              Verify your identity
            </h2>
            <p className="text-balance text-sm text-slate-400">
              Welcome{auth.name ? `, ${auth.name}` : ""}! A World ID is required
              to submit sightings and earn{" "}
              <strong className="text-foam">OCEAN</strong> rewards.
            </p>
          </div>

          {worldIdError ? (
            <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
              {worldIdError}
            </p>
          ) : null}

          <IDKitWidget
            app_id={WORLD_APP_ID as `app_${string}`}
            action={WORLD_ACTION}
            verification_level={VerificationLevel.Device}
            handleVerify={handleWorldIdVerify}
            onSuccess={onWorldIdSuccess}
            onError={onWorldIdError}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={open}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 py-4 font-semibold text-abyss-950 shadow-glow transition hover:from-reef-400 hover:to-lagoon-500"
              >
                <WorldIdOrb className="h-5 w-5" />
                Continue with World ID
              </button>
            )}
          </IDKitWidget>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => void handleMockWorldId()}
              className="w-full rounded-2xl border border-dashed border-lagoon-500/30 bg-abyss-900/60 py-3 text-sm font-medium text-lagoon-400/70 transition hover:border-lagoon-500/60 hover:text-lagoon-300"
            >
              ⚙ Mock World ID (dev only)
            </button>
          )}

          <button
            type="button"
            onClick={() => void auth.logout()}
            className="w-full rounded-2xl border border-slate-700 bg-abyss-850 py-3 text-sm font-medium text-slate-400 transition hover:border-coral-500/40 hover:text-coral-300"
          >
            Disconnect
          </button>

          <p className="text-center text-xs text-slate-600">
            World ID protects your privacy via zero-knowledge proofs.
            No personal data is shared.
          </p>
        </div>
      </Layout>
    );
  }

  // ── Step 1: Connect wallet ─────────────────────────────────────────────
  return (
    <Layout title="Connect">
      <div className="mt-4 space-y-6">
        <p className="text-sm text-slate-400">
          Connect your <strong className="text-foam">Hedera</strong> wallet
          to access OceanWatch. We support{" "}
          <strong className="text-foam">HashPack</strong>,{" "}
          <strong className="text-foam">Blade</strong>, and other
          WalletConnect-compatible wallets.
        </p>

        {authError ? (
          <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
            {authError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleConnectAndAuth()}
          disabled={isAuthPending || auth.isInitializing}
          className={[
            "w-full rounded-2xl py-3.5 font-semibold transition",
            isAuthPending || auth.isInitializing
              ? "cursor-wait bg-abyss-800 text-slate-500"
              : "bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 text-abyss-950 shadow-glow hover:from-reef-400 hover:to-lagoon-500",
          ].join(" ")}
        >
          {auth.isInitializing
            ? "Initializing..."
            : isAuthPending
              ? "Connecting..."
              : "Connect Wallet"}
        </button>

        {connectedButNoJwt(auth) && (
          <p className="text-center font-mono text-xs text-slate-500">
            {auth.connectedAccountId}
          </p>
        )}

        <p className="text-center text-xs text-slate-600">
          Your wallet signs a one-time message to prove ownership.
          No transaction fees are charged.
        </p>
      </div>
    </Layout>
  );
}

function connectedButNoJwt(auth: { connectedAccountId: string | null; jwt: string | null }) {
  return auth.connectedAccountId && !auth.jwt;
}

function WorldIdOrb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.65" />
      <circle cx="16" cy="16" r="5.5" fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="16" r="2"   fill="currentColor" opacity="0.3" />
    </svg>
  );
}
