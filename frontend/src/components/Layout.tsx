import type { ReactNode } from "react";
import { BottomNav, DesktopBurgerNav } from "./BottomNav";
import { WaveBackdrop } from "./WaveBackdrop";

type Props = {
  children: ReactNode;
  title?: string;
};

export function Layout({ children, title }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <WaveBackdrop />
      {/* z-50 so desktop burger + overlay stack above <main> (also z-10 — same z-index = later sibling wins). */}
      <header className="relative z-50 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-lg items-start justify-between gap-3 px-4 pb-2">
          <div className="min-w-0 flex-1">
            {title ? (
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foam">
                {title}
              </h1>
            ) : null}
          </div>
          <DesktopBurgerNav />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-lg flex-1 px-4 pb-28 md:pb-10">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
