import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/report", label: "Report", icon: PinIcon },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/history", label: "History", icon: LogIcon },
];

export function BottomNav() {
  return (
    <nav
      className="safe-pb fixed bottom-0 left-0 right-0 z-40 border-t border-lagoon-500/15 bg-abyss-900/90 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg justify-around px-2 pt-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-reef-400"
                  : "text-slate-400 hover:text-foam/80",
              ].join(" ")
            }
          >
            <Icon className="h-6 w-6" aria-hidden />
            {label}
          </NavLink>
        ))}
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

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
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
