import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { SightingsMap } from "../components/SightingsMap";
import { fetchSightings } from "../graphql/api";

export function HomePage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["sightings"],
    queryFn: () => fetchSightings(),
  });

  return (
    <Layout title="Marine sightings">
      <div className="relative mt-2 space-y-6">
        <div className="rounded-2xl border border-lagoon-500/20 bg-abyss-850/80 p-5 shadow-card backdrop-blur-sm">
          <p className="text-balance text-sm leading-relaxed text-slate-300">
            A digital field notebook for citizen science around{" "}
            <strong className="text-foam">Cozumel</strong>: explore zones on the map and browse
            confirmed sightings from the{" "}
            <strong className="text-foam">Ocean Watch indexer</strong> (GraphQL). The indexer is
            read-only from this app; reporting is explained on the Report tab.
          </p>
        </div>

        <section className="space-y-3" aria-labelledby="home-map-heading">
          <h2 id="home-map-heading" className="font-display text-lg text-reef-300">
            Sightings map
          </h2>
          <p className="text-sm text-slate-400">
            Indexed reports at latitude and longitude — same map as on History. Open the{" "}
            <Link to="/history" className="text-lagoon-400 underline hover:text-foam">
              History
            </Link>{" "}
            page for the full list and media.
          </p>

          {isPending ? (
            <div className="h-[min(55vh,24rem)] min-h-[220px] animate-pulse rounded-2xl bg-abyss-800/70" aria-busy />
          ) : null}

          {isError ? (
            <div
              className="rounded-2xl border border-coral-500/40 bg-coral-500/10 p-4 text-sm text-coral-200"
              role="alert"
            >
              Could not load sightings map.
              <button
                type="button"
                className="mt-2 block font-medium text-reef-300 underline"
                onClick={() => void refetch()}
              >
                Try again
              </button>
            </div>
          ) : null}

          {data && data.length > 0 && !isError ? <SightingsMap sightings={data} /> : null}

          {data && data.length === 0 && !isPending && !isError ? (
            <p className="rounded-2xl border border-dashed border-lagoon-500/25 bg-abyss-850/50 p-4 text-center text-sm text-slate-400">
              No sightings returned by the indexer yet.
            </p>
          ) : null}
        </section>

        <div className="grid gap-3">
          <Link
            to="/report"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 px-5 py-4 font-semibold text-abyss-950 shadow-glow transition hover:from-reef-400 hover:to-lagoon-500"
          >
            <span>New sighting</span>
            <span aria-hidden className="text-xl">
              →
            </span>
          </Link>
          <Link
            to="/history"
            className="rounded-2xl border border-lagoon-500/30 bg-abyss-800/60 px-5 py-4 text-center font-medium text-foam transition hover:border-reef-400/40 hover:bg-abyss-800"
          >
            View my history
          </Link>
        </div>

        <section
          className="rounded-2xl border border-white/5 bg-abyss-900/40 p-4"
          aria-labelledby="tips-heading"
        >
          <h2 id="tips-heading" className="font-display text-lg text-reef-300">
            Good practice
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex gap-2">
              <span className="text-lagoon-400" aria-hidden>
                ◆
              </span>
              Record local time of the sighting and visibility when relevant.
            </li>
            <li className="flex gap-2">
              <span className="text-lagoon-400" aria-hidden>
                ◆
              </span>
              Tap the map in the area where you observed the animal.
            </li>
            <li className="flex gap-2">
              <span className="text-lagoon-400" aria-hidden>
                ◆
              </span>
              Respect wildlife: keep a safe distance; do not harass animals.
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}
