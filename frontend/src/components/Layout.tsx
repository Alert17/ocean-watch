import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { persistConnectedHederaAccount } from "../hooks/useAuth";
import { connectHederaWallet } from "../lib/hederaWallet";
import { BottomNav } from "./BottomNav";
import { WaveBackdrop } from "./WaveBackdrop";

type Props = {
  children: ReactNode;
  title?: string;
};

export function Layout({ children, title }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAccount =
    location.pathname === "/my-account" || location.pathname === "/world-id";

  const handleMyAccount = () => {
    void (async () => {
      setError(null);
      setBusy(true);
      try {
        const accountId = await connectHederaWallet();
        persistConnectedHederaAccount(accountId);
        navigate("/my-account");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Connexion impossible";
        const quiet =
          /reject|closed|cancel|annul/i.test(msg) || msg.includes("User rejected");
        if (!quiet) {
          setError(msg);
        }
      } finally {
        setBusy(false);
      }
    })();
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <WaveBackdrop />
      <header className="relative z-10 flex flex-col gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title ? (
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foam">
                {title}
              </h1>
            ) : null}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={handleMyAccount}
            className={[
              "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
              busy ? "cursor-wait opacity-70" : "",
              onAccount
                ? "border-reef-400/50 bg-reef-500/15 text-reef-300"
                : "border-lagoon-500/25 bg-abyss-850/80 text-lagoon-400 hover:border-lagoon-400/40 hover:text-foam",
            ].join(" ")}
            aria-label="My account"
            aria-busy={busy}
            aria-current={onAccount ? "page" : undefined}
          >
            <UserCircleIcon className="h-6 w-6" aria-hidden />
          </button>
        </div>
        {error ? (
          <p className="text-right text-xs text-coral-300" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6.5 19.2v-.7c0-2.5 2-4.5 5.5-4.5s5.5 2 5.5 4.5v.7" />
    </svg>
  );
}
