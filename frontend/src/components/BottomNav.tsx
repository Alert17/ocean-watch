import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navEntries = [
  { to: "/", label: "Home", icon: HomeIcon, end: true as const },
  { to: "/report", label: "Report", icon: PinIcon, end: false as const },
  { to: "/history", label: "History", icon: LogIcon, end: false as const },
  { to: "/map", label: "Map", icon: MapIcon, end: false as const },
  { to: "/donate", label: "Donate", icon: HeartIcon, end: false as const },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const onAccount = location.pathname === "/my-account";

  const handleMyAccount = () => {
    navigate("/my-account");
  };

  const itemClass = (isActive: boolean) =>
    [
      "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors sm:text-xs",
      isActive ? "text-reef-400" : "text-slate-400 hover:text-foam/80",
    ].join(" ");

  return (
    <nav
      className="safe-pb fixed bottom-0 left-0 right-0 z-40 border-t border-lagoon-500/15 bg-abyss-900/90 backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-lg px-1 pt-1">
        <div className="flex justify-between gap-0.5 pb-2 pt-1">
          {navEntries.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => itemClass(isActive)}
            >
              <Icon className="h-6 w-6 shrink-0" aria-hidden />
              {label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleMyAccount}
            className={itemClass(onAccount)}
            aria-label="My account"
            aria-current={onAccount ? "page" : undefined}
          >
            <UserCircleIcon className="h-6 w-6 shrink-0" aria-hidden />
            Account
          </button>
        </div>
      </div>
    </nav>
  );
}

/** Desktop: same routes as the bottom bar, in a top-right burger menu. */
export function DesktopBurgerNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, close]);

  const onAccount = location.pathname === "/my-account";

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
          open
            ? "border-reef-400/50 bg-reef-500/15 text-reef-300"
            : "border-lagoon-500/25 bg-abyss-850/80 text-lagoon-400 hover:border-lagoon-400/40 hover:text-foam",
        ].join(" ")}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {open ? (
          <CloseIcon className="h-5 w-5" aria-hidden />
        ) : (
          <MenuIcon className="h-5 w-5" aria-hidden />
        )}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-[60] bg-abyss-950/50 backdrop-blur-[2px]"
            aria-hidden
            onClick={close}
          />
          <div
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] min-w-[13rem] rounded-2xl border border-lagoon-500/20 bg-abyss-900/95 py-2 shadow-xl backdrop-blur-md"
            role="menu"
            aria-label="Main navigation"
          >
            {navEntries.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                role="menuitem"
                onClick={close}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                    isActive ? "bg-reef-500/10 text-reef-300" : "text-slate-300 hover:bg-abyss-850/80 hover:text-foam",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                navigate("/my-account");
                close();
              }}
              className={[
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors",
                onAccount ? "bg-reef-500/10 text-reef-300" : "text-slate-300 hover:bg-abyss-850/80 hover:text-foam",
              ].join(" ")}
            >
              <UserCircleIcon className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
              Account
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 6h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8" />
      <path d="M4 12h9M7 9l-3 3 3 3" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
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
      <path d="M9 20 3.553 17.276A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 .553-.894L9 2l6 3 5.447-2.724A1 1 0 0 1 21 3.618v10.764a1 1 0 0 1-.553.894L15 20l-6-3-6 3z" />
      <path d="M9 2v18M15 5v15" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 0 1 7.5-3.37A4.5 4.5 0 0 1 19 11c0 5.65-7 10-7 10Z" />
    </svg>
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
