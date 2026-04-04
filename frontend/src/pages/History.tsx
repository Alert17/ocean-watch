import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/Layout";
import { behaviorLabel, speciesLabel } from "../constants/fieldbook";
import { fetchMySightings } from "../graphql/api";

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function HistoryPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["mySightings"],
    queryFn: () => fetchMySightings(40),
  });

  return (
    <Layout title="Historique">
      <div className="mt-2 space-y-4">
        <p className="text-sm text-slate-400">
          Liste de vos observations enregistrées (GraphQL mocké en développement).
        </p>

        {isPending ? (
          <ul className="space-y-3" aria-busy>
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-abyss-800/60"
              />
            ))}
          </ul>
        ) : null}

        {isError ? (
          <div
            className="rounded-2xl border border-coral-500/40 bg-coral-500/10 p-4 text-sm text-coral-200"
            role="alert"
          >
            Impossible de charger l’historique.
            <button
              type="button"
              className="mt-2 block font-medium text-reef-300 underline"
              onClick={() => void refetch()}
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {data && data.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-lagoon-500/25 bg-abyss-850/50 p-6 text-center text-sm text-slate-400">
            Aucune observation pour l’instant. Commencez par une déclaration depuis l’onglet{" "}
            <span className="text-foam">Signaler</span>.
          </p>
        ) : null}

        {data && data.length > 0 ? (
          <ul className="space-y-3">
            {data.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-lagoon-500/15 bg-abyss-850/70 p-4 shadow-card"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-lg text-foam">
                    {speciesLabel(s.species)}
                  </span>
                  <time
                    className="text-xs text-lagoon-400/90"
                    dateTime={s.observedAt}
                  >
                    {formatWhen(s.observedAt)}
                  </time>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {s.count} individu{s.count > 1 ? "s" : ""} ·{" "}
                  {behaviorLabel(s.behavior)}
                </p>
                {s.zoneName ? (
                  <p className="mt-2 text-xs uppercase tracking-wider text-reef-400/90">
                    Zone · {s.zoneName}
                  </p>
                ) : null}
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  {s.latitude.toFixed(4)}°, {s.longitude.toFixed(4)}°
                </p>
                {s.comment ? (
                  <p className="mt-2 border-t border-white/5 pt-2 text-sm text-slate-300">
                    {s.comment}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Layout>
  );
}
