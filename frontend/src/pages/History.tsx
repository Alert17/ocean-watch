import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Layout } from "../components/Layout";
import { SightingsMap } from "../components/SightingsMap";
import { behaviorLabel, speciesLabel } from "../constants/fieldbook";
import { fetchSightings } from "../graphql/api";
import type { Sighting } from "../graphql/types";

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function isProbablyVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

type MediaModalProps = {
  sighting: Sighting;
  onClose: () => void;
};

function SightingMediaModal({ sighting, onClose }: MediaModalProps) {
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [sighting.id, sighting.mediaUrl]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onKeyDown]);

  const url = sighting.mediaUrl;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-abyss-950/80 backdrop-blur-sm"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-lagoon-500/25 bg-abyss-900 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-lagoon-500/15 px-4 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold text-foam">
              {speciesLabel(sighting.species)}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatWhen(sighting.observedAt)} · {sighting.count}{" "}
              {sighting.count === 1 ? "individual" : "individuals"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lagoon-500/25 text-slate-400 transition hover:border-lagoon-400/40 hover:text-foam"
            aria-label="Close"
          >
            <span className="text-xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {url ? (
            isProbablyVideoUrl(url) ? (
              <video
                src={url}
                className="mx-auto max-h-[min(70vh,640px)] w-full rounded-xl bg-black object-contain"
                controls
                playsInline
              />
            ) : imageFailed ? (
              <div className="rounded-xl border border-dashed border-lagoon-500/30 bg-abyss-850/80 p-8 text-center text-sm text-slate-400">
                <p>Preview unavailable for this file.</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-medium text-lagoon-400 underline hover:text-foam"
                >
                  Open media in new tab
                </a>
              </div>
            ) : (
              <img
                src={url}
                alt={`Sighting media — ${speciesLabel(sighting.species)}`}
                className="mx-auto max-h-[min(70vh,640px)] w-full rounded-xl object-contain"
                onError={() => setImageFailed(true)}
              />
            )
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">
              No photo or media was uploaded for this sighting.
            </p>
          )}
        </div>

        {url ? (
          <div className="border-t border-lagoon-500/15 px-4 py-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-lagoon-400 underline hover:text-foam"
            >
              Open original in new tab
            </a>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function HistoryPage() {
  const [previewSighting, setPreviewSighting] = useState<Sighting | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["sightings"],
    queryFn: () => fetchSightings(),
  });

  return (
    <Layout title="History">
      <div className="mt-2 space-y-4">
        <p className="text-sm text-slate-400">
          Sightings from the indexer (<code className="text-lagoon-400/90">sightings</code> with
          pagination) — map shows each record at its latitude and longitude. Tap a sighting below to
          open details and media.
        </p>

        {isPending ? (
          <div className="space-y-3" aria-busy>
            <div className="h-[min(55vh,24rem)] min-h-[220px] animate-pulse rounded-2xl bg-abyss-800/70" />
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-abyss-800/60"
              />
            ))}
          </div>
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
          <>
            <SightingsMap sightings={data} />
            <h2 className="font-display text-lg text-reef-300">Details</h2>
            <ul className="space-y-3">
              {data.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setPreviewSighting(s)}
                    className="w-full rounded-2xl border border-lagoon-500/15 bg-abyss-850/70 p-4 text-left shadow-card transition hover:border-lagoon-500/35 hover:bg-abyss-850 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-reef-400/60"
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
                    <p className="mt-1 font-mono text-[10px] text-slate-500">
                      {s.latitude.toFixed(4)}°, {s.longitude.toFixed(4)}° · consensus{" "}
                      {s.consensusTimestamp}
                    </p>
                    {s.comment ? (
                      <p className="mt-2 border-t border-white/5 pt-2 text-sm text-slate-300">
                        {s.comment}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-lagoon-500/90">
                      {s.mediaUrl ? "Tap to view media" : "Tap for details — no media"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {previewSighting ? (
        <SightingMediaModal
          sighting={previewSighting}
          onClose={() => setPreviewSighting(null)}
        />
      ) : null}
    </Layout>
  );
}
