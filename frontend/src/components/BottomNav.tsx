import { NavLink, useLocation, useNavigate } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/report", label: "Report", icon: PinIcon },
  { to: "/history", label: "History", icon: LogIcon },
  { to: "/donate", label: "Donate", icon: HeartIcon },
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
      className="safe-pb fixed bottom-0 left-0 right-0 z-40 border-t border-lagoon-500/15 bg-abyss-900/90 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-lg px-1 pt-1">
        <div className="flex justify-between gap-0.5 pb-2 pt-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
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
