import { useQuery } from "@tanstack/react-query";
import { Layout } from "../components/Layout";
import { behaviorLabel, speciesLabel } from "../constants/fieldbook";
import { fetchSightings } from "../graphql/api";

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function HistoryPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["sightings"],
    queryFn: fetchSightings,
  });

  return (
    <Layout title="History">
      <div className="mt-2 space-y-4">
        <p className="text-sm text-slate-400">
          Sightings from the indexer (<code className="text-lagoon-400/90">sightings</code> query).
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
            Could not load sightings.
            <button
              type="button"
              className="mt-2 block font-medium text-reef-300 underline"
              onClick={() => void refetch()}
            >
              Try again
            </button>
          </div>
        ) : null}

        {data && data.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-lagoon-500/25 bg-abyss-850/50 p-6 text-center text-sm text-slate-400">
            No sightings returned by the indexer yet.
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
                  {s.count} {s.count === 1 ? "individual" : "individuals"} ·{" "}
                  {behaviorLabel(s.behavior)}
                </p>
                <p className="mt-2 text-xs uppercase tracking-wider text-reef-400/90">
                  Seq. {s.sequenceNumber} · Wallet {s.wallet}
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-500">
                  {s.latitude.toFixed(4)}°, {s.longitude.toFixed(4)}° · consensus{" "}
                  {s.consensusTimestamp}
                </p>
                {s.comment ? (
                  <p className="mt-2 border-t border-white/5 pt-2 text-sm text-slate-300">
                    {s.comment}
                  </p>
                ) : null}
                {s.mediaUrl ? (
                  <p className="mt-1 text-xs text-lagoon-400">
                    <a href={s.mediaUrl} className="underline" target="_blank" rel="noreferrer">
                      Media
                    </a>
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
