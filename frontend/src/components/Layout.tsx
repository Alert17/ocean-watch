import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { WaveBackdrop } from "./WaveBackdrop";
import { BottomNav } from "./BottomNav";

type Props = {
  children: ReactNode;
  title?: string;
};

export function Layout({ children, title }: Props) {
  const location = useLocation();
  const onAccount = location.pathname === "/my-account";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <WaveBackdrop />
      <header className="relative z-10 flex items-start justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0 flex-1">
          {title ? (
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foam">
              {title}
            </h1>
          ) : null}
        </div>
        <Link
          to="/my-account"
          className={[
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
            onAccount
              ? "border-reef-400/50 bg-reef-500/15 text-reef-300"
              : "border-lagoon-500/25 bg-abyss-850/80 text-lagoon-400 hover:border-lagoon-400/40 hover:text-foam",
          ].join(" ")}
          aria-label="My account"
          aria-current={onAccount ? "page" : undefined}
        >
          <UserCircleIcon className="h-6 w-6" aria-hidden />
        </Link>
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
