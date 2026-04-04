/**
 * MyAccount — two-step auth flow:
 *
 *   Step 1: Wallet     → dev mock (⚙) OR HashPack/WalletConnect (coming soon)
 *   Step 2: World ID   → IDKitWidget → POST /worldid/verify → verified
 *
 * World ID:
 *   App ID : app_5e00cf5d85b7fa221f91d0de558c70c3
 *   Action : verify-human
 *   Level  : Device
 */

import { IDKitWidget, VerificationLevel, type ISuccessResult } from "@worldcoin/idkit";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import { verifyWorldId } from "../lib/api";

const WORLD_APP_ID = (import.meta.env.VITE_WORLDID_APP_ID as string | undefined) ?? "app_5e00cf5d85b7fa221f91d0de558c70c3";
const WORLD_ACTION = (import.meta.env.VITE_WORLDID_ACTION as string | undefined) ?? "verify-human";

const DEV_MOCK_WALLET = "0.0.99999";
const DEV_MOCK_NAME   = "Dev User";

export function MyAccountPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [worldIdError, setWorldIdError] = useState<string | null>(null);

  // ── Dev mock: bypass backend auth entirely ─────────────────────────────
  const handleDevMockConnect = () => {
    auth.setAuth("mock-jwt-dev", DEV_MOCK_WALLET, DEV_MOCK_NAME);
  };

  // ── Step 2: World ID ───────────────────────────────────────────────────
  const handleWorldIdVerify = async (result: ISuccessResult) => {
    if (!auth.jwt) throw new Error("JWT missing — reconnect your wallet.");
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
    if (!data.verified) throw new Error("World ID verification failed.");
  };

  const onWorldIdSuccess = () => {
    auth.setWorldIdVerified();
    navigate("/report");
  };

  const onWorldIdError = () => {
    setWorldIdError("World ID verification failed. Please try again.");
  };

  // ── Fully authenticated view ───────────────────────────────────────────
  if (auth.isReady) {
    return (
      <Layout title="Mon compte">
        <div className="mt-4 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-reef-500/30 bg-reef-500/10 px-4 py-3">
            <WorldIdOrb className="h-8 w-8 shrink-0 text-reef-300" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foam">
                {auth.name ?? auth.wallet} — World ID verified
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-500 break-all">
                {auth.wallet}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={auth.logout}
            className="w-full rounded-2xl border border-slate-700 bg-abyss-850 py-3 text-sm font-medium text-slate-400 transition hover:border-coral-500/40 hover:text-coral-300"
          >
            Se déconnecter
          </button>
        </div>
      </Layout>
    );
  }

  // ── Step 2: World ID verification (JWT acquired, World ID pending) ─────
  if (auth.jwt) {
    return (
      <Layout title="Vérification">
        <div className="mt-6 flex flex-col items-center gap-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-lagoon-500/20 bg-abyss-800/80 shadow-glow">
            <WorldIdOrb className="h-12 w-12 text-lagoon-400" />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="font-display text-2xl font-semibold text-foam">
              Vérifiez votre identité
            </h2>
            <p className="text-balance text-sm text-slate-400">
              Bienvenue{auth.name ? `, ${auth.name}` : ""} ! Un World ID est requis
              pour soumettre une observation et recevoir des récompenses{" "}
              <strong className="text-foam">OCEAN</strong>.
            </p>
          </div>

          {worldIdError ? (
            <p className="w-full rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
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
                Continuer avec World ID
              </button>
            )}
          </IDKitWidget>

          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={onWorldIdSuccess}
              className="w-full rounded-2xl border border-dashed border-lagoon-500/30 bg-abyss-900/60 py-3 text-sm font-medium text-lagoon-400/70 transition hover:border-lagoon-500/60 hover:text-lagoon-300"
            >
              ⚙ Mock World ID (dev only)
            </button>
          )}

          <button
            type="button"
            onClick={auth.logout}
            className="w-full rounded-2xl border border-slate-700 bg-abyss-850 py-3 text-sm font-medium text-slate-400 transition hover:border-coral-500/40 hover:text-coral-300"
          >
            Se déconnecter
          </button>

          <p className="text-center text-xs text-slate-600">
            World ID protège votre vie privée via une preuve à divulgation nulle.
            Aucune donnée personnelle n'est partagée.
          </p>
        </div>
      </Layout>
    );
  }

  // ── Step 1: Connect Hedera wallet ──────────────────────────────────────
  return (
    <Layout title="Connexion">
      <div className="mt-4 space-y-6">
        <p className="text-sm text-slate-400">
          Connectez votre wallet <strong className="text-foam">Hedera</strong>{" "}
          pour accéder à OceanWatch.
        </p>

        <div className="rounded-xl border border-lagoon-500/20 bg-abyss-800/60 px-4 py-3 text-xs text-slate-500">
          <strong className="text-lagoon-400">Bientôt disponible :</strong> la connexion
          via <span className="text-foam">HashPack</span> ou{" "}
          <span className="text-foam">WalletConnect</span> sera intégrée prochainement.
        </div>

        {/* Dev-only mock Hedera connection */}
        {import.meta.env.DEV && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] uppercase tracking-widest text-slate-600">dev only</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            <button
              type="button"
              onClick={handleDevMockConnect}
              className="w-full rounded-2xl border border-dashed border-lagoon-500/30 bg-abyss-900/60 py-3 text-sm font-medium text-lagoon-400/70 transition hover:border-lagoon-500/60 hover:text-lagoon-300"
            >
              ⚙ Mock Hedera wallet (dev only)
            </button>
          </div>
        )}
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
      <circle cx="16" cy="16" r="2"   fill="currentColor" opacity="0.3" />
    </svg>
  );
}
