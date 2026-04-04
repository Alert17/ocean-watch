/**
 * World ID — two-step auth flow:
 *   Step 1: Wallet login / register  (POST /auth/login → POST /auth/register)
 *   Step 2: World ID verification    (IDKitWidget → POST /worldid/verify)
 *
 * App ID  : app_5e00cf5d85b7fa221f91d0de558c70c3
 * Action  : verify-human
 * Level   : Device (selfie)
 *
 * Route: /world-id
 * Docs: /WORLDID.md, /API.md
 */

import { IDKitWidget, VerificationLevel, type ISuccessResult } from "@worldcoin/idkit";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import { loginUser, registerUser, verifyWorldId } from "../lib/api";

const WORLD_APP_ID = "app_5e00cf5d85b7fa221f91d0de558c70c3" as const;
const WORLD_ACTION = "verify-human";

export function WorldIdPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(auth.wallet ?? "");
  const [name, setName] = useState(auth.name ?? "");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [worldIdError, setWorldIdError] = useState<string | null>(null);

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const trimmedWallet = wallet.trim();
    const trimmedName = name.trim();

    if (!trimmedWallet) {
      setAuthError("Hedera account ID is required.");
      return;
    }

    setIsAuthPending(true);
    try {
      let res;
      try {
        res = await loginUser(trimmedWallet);
      } catch {
        if (!trimmedName) {
          setAuthError("Account not found. Enter a name to create an account.");
          setIsAuthPending(false);
          return;
        }
        res = await registerUser(trimmedWallet, trimmedName);
      }
      auth.setAuth(res.token, res.user.wallet, res.user.name);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setIsAuthPending(false);
    }
  };

  const handleWorldIdVerify = async (result: ISuccessResult) => {
    if (!auth.jwt) throw new Error("Missing JWT — sign in again.");
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

  if (auth.isReady) {
    return (
      <Layout title="World ID">
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

          <Link
            to="/my-account"
            className="block w-full rounded-2xl border border-lagoon-500/30 bg-abyss-850 py-3 text-center text-sm font-medium text-lagoon-400 transition hover:border-lagoon-400/50 hover:text-foam"
          >
            Back to my account
          </Link>

          <button
            type="button"
            onClick={auth.logout}
            className="w-full rounded-2xl border border-slate-700 bg-abyss-850 py-3 text-sm font-medium text-slate-400 transition hover:border-coral-500/40 hover:text-coral-300"
          >
            Sign out
          </button>
        </div>
      </Layout>
    );
  }

  if (auth.jwt) {
    return (
      <Layout title="World ID">
        <div className="mt-6 flex flex-col items-center gap-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-lagoon-500/20 bg-abyss-800/80 shadow-glow">
            <WorldIdOrb className="h-12 w-12 text-lagoon-400" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="font-display text-2xl font-semibold text-foam">
              Verify your identity
            </h2>
            <p className="text-balance text-sm text-slate-400">
              Welcome{auth.name ? `, ${auth.name}` : ""}! World ID is required to submit a sighting
              and earn <strong className="text-foam">OCEAN</strong> rewards.
            </p>
          </div>

          {worldIdError ? (
            <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
              {worldIdError}
            </p>
          ) : null}

          <IDKitWidget
            app_id={WORLD_APP_ID}
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

          <p className="text-center text-xs text-slate-600">
            World ID protects your privacy with a zero-knowledge proof. No personal data is shared.
          </p>

          <Link to="/my-account" className="text-sm text-lagoon-400 underline">
            Back to my account
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="World ID">
      <div className="mt-4 space-y-6">
        <p className="text-sm text-slate-400">
          Enter your <strong className="text-foam">Hedera</strong> account ID to access Ocean Watch.
          If you do not have an account yet, add a name to create one.
        </p>

        <form onSubmit={(e) => { void handleWalletSubmit(e); }} className="space-y-4">
          <label className="block text-sm">
            <span className="text-slate-400">Hedera account (e.g. 0.0.12345)</span>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0.0.XXXXX"
              autoComplete="off"
              spellCheck={false}
              className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 font-mono text-foam outline-none ring-reef-400/40 placeholder:text-slate-600 focus:ring-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-400">Name <span className="text-slate-600">(required for a new account)</span></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John"
              className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 placeholder:text-slate-600 focus:ring-2"
            />
          </label>

          {authError ? (
            <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
              {authError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isAuthPending}
            className={[
              "w-full rounded-2xl py-3.5 font-semibold transition",
              isAuthPending
                ? "cursor-wait bg-abyss-800 text-slate-500"
                : "bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 text-abyss-950 shadow-glow hover:from-reef-400 hover:to-lagoon-500",
            ].join(" ")}
          >
            {isAuthPending ? "Signing in…" : "Continue"}
          </button>
        </form>

        <Link to="/my-account" className="block text-center text-sm text-lagoon-400 underline">
          Back to my account
        </Link>
      </div>
    </Layout>
  );
}

function WorldIdOrb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.65" />
      <circle cx="16" cy="16" r="5.5" fill="currentColor" opacity="0.9" />
      <circle cx="16" cy="16" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
