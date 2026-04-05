import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { WaveBackdrop } from "./WaveBackdrop";

type Props = {
  children: ReactNode;
  title?: string;
};

export function Layout({ children, title }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <WaveBackdrop />
      <header className="relative z-10 flex flex-col gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          {title ? (
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foam">
              {title}
            </h1>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-28">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
