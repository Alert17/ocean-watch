import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { MapPicker, type MapPick } from "../components/MapPicker";
import {
  BEHAVIOR_OPTIONS,
  BEHAVIOR_VALUES,
  Behavior,
  SPECIES_OPTIONS,
  SPECIES_VALUES,
  Species,
} from "../constants/fieldbook";
import { MARINE_ZONES } from "../data/marineZones";
import { useAuth } from "../hooks/useAuth";
import { submitSightingToApi } from "../lib/api";
import { toDatetimeLocalValue } from "../lib/datetime";

const formSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    zoneId: z.string(),
    species: z.enum(SPECIES_VALUES),
    count: z.coerce.number().int().min(1).max(99),
    behavior: z.enum(BEHAVIOR_VALUES),
    observedAt: z.string().min(1, "Date and time are required"),
    comment: z.string().optional(),
  })
  .refine((d) => d.latitude !== 0 || d.longitude !== 0, {
    message: "Tap the map to place your sighting.",
    path: ["latitude"],
  });

type FormValues = z.infer<typeof formSchema>;

/** A locally-selected media file ready for preview. */
type MediaItem = {
  preview: string; // Object URL (revoked on removal / unmount)
  name: string;
  kind: "image" | "video";
};

export function ReportPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  // Redirect to account/login page if JWT or World ID is missing.
  useEffect(() => {
    if (!auth.isReady) navigate("/my-account", { replace: true });
  }, [auth.isReady, navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Keep object URLs and revoke them when the component unmounts or items change.
  const mediaItemsRef = useRef(mediaItems);
  mediaItemsRef.current = mediaItems;
  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach((m) => URL.revokeObjectURL(m.preview));
    };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: 0,
      longitude: 0,
      zoneId: "",
      species: Species.UNKNOWN,
      count: 1,
      behavior: Behavior.UNKNOWN,
      observedAt: toDatetimeLocalValue(new Date().toISOString()),
      comment: "",
    },
  });

  const [lat, lng, zoneId] = [watch("latitude"), watch("longitude"), watch("zoneId")];

  // Derive the human-readable zone name for display in the map header.
  const selectedZone = MARINE_ZONES.find((z) => z.id === zoneId);

  const onMapChange = (pick: MapPick) => {
    setValue("latitude", pick.lat, { shouldValidate: true });
    setValue("longitude", pick.lng, { shouldValidate: true });
    setValue("zoneId", pick.zoneId ?? "", { shouldValidate: true });
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    if (!auth.jwt) {
      navigate("/my-account", { replace: true });
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitSightingToApi(
        {
          latitude: values.latitude,
          longitude: values.longitude,
          species: values.species,
          count: values.count,
          behavior: values.behavior,
          observedAt: new Date(values.observedAt).toISOString(),
          comment: values.comment || undefined,
          // TODO: upload files to IPFS and pass the resulting URL here.
          // Backend accepts an IPFS URL string in `mediaUrl`.
          mediaUrl: undefined,
        },
        auth.jwt,
      );
      navigate("/congrats");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  });

  // ── Media helpers ────────────────────────────────────────────────────

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newItems: MediaItem[] = files.map((file) => ({
      preview: URL.createObjectURL(file),
      name: file.name,
      kind: file.type.startsWith("video/") ? "video" : "image",
    }));
    setMediaItems((prev) => [...prev, ...newItems]);
    // Reset so the same file can be added again if needed.
    e.target.value = "";
  };

  const removeMedia = (idx: number) => {
    setMediaItems((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <Layout title="Report">
      <div className="mt-2 space-y-5">

        {/* ── Context instructions ─────────────────────────── */}
        <p className="text-sm text-slate-400">
          Drop a pin where you saw a shark off{" "}
          <strong className="text-foam">Cozumel</strong>, then complete the form.
        </p>

        {/* ── Isla Cozumel map ──────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-lagoon-500/25 bg-abyss-850/50">
          {/* Map header */}
          <div className="flex items-center justify-between border-b border-lagoon-500/15 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {/* Location icon */}
              <svg
                className="h-4 w-4 shrink-0 text-reef-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="font-display text-sm font-medium text-foam">
                Isla Cozumel
              </span>
            </div>
            {/* Selected zone */}
            {selectedZone ? (
              <span className="flex items-center gap-1 rounded-lg bg-reef-500/15 px-2 py-0.5 text-xs font-medium text-reef-300">
                <span className="h-1.5 w-1.5 rounded-full bg-reef-400" aria-hidden />
                {selectedZone.name}
              </span>
            ) : (
              <span className="text-xs text-slate-600">No zone selected</span>
            )}
          </div>
          {/* Leaflet map */}
          <MapPicker
            zones={[]}
            value={pickFromForm(lat, lng, zoneId)}
            onChange={onMapChange}
          />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("zoneId")} />

          {errors.latitude ? (
            <p className="text-sm text-coral-400" role="alert">
              {errors.latitude.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-400">Species (estimate)</span>
              <select
                className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 focus:ring-2"
                {...register("species")}
              >
                {SPECIES_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-400">Number of individuals</span>
              <input
                type="number"
                min={1}
                max={99}
                className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 focus:ring-2"
                {...register("count")}
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-slate-400">Observed behavior</span>
            <select
              className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 focus:ring-2"
              {...register("behavior")}
            >
              {BEHAVIOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-slate-400">Date and time of sighting</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 focus:ring-2"
              {...register("observedAt")}
            />
            {errors.observedAt ? (
              <span className="mt-1 block text-xs text-coral-400">
                {errors.observedAt.message}
              </span>
            ) : null}
          </label>

          <label className="block text-sm">
            <span className="text-slate-400">Field notes (optional)</span>
            <textarea
              rows={3}
              placeholder="Depth, visibility, other species nearby…"
              className="mt-1 w-full resize-none rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 placeholder:text-slate-600 focus:ring-2"
              {...register("comment")}
            />
          </label>

          {/* Media section */}
          <div className="block text-sm">
            <span className="text-slate-400">Photos / videos (optional)</span>
            {/*
             * TODO (backend): mediaUrl accepts a single IPFS URL string.
             * Multi-file upload to IPFS must be implemented separately.
             * Currently the selected files are only previewed locally and
             * are NOT sent to the backend.
             */}

            {/* File add trigger */}
            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lagoon-500/30 bg-abyss-900/60 px-4 py-3 transition hover:border-lagoon-500/50 hover:bg-abyss-900/80">
              <CameraIcon className="h-5 w-5 shrink-0 text-lagoon-400" />
              <span className="text-slate-400">
                Add photos or videos
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={handleMediaAdd}
              />
            </label>

            {/* Preview grid */}
            {mediaItems.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {mediaItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-xl border border-lagoon-500/20 bg-abyss-900"
                  >
                    {item.kind === "image" ? (
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.preview}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    )}
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-abyss-950/80 text-slate-300 transition hover:bg-coral-500/80 hover:text-white"
                      aria-label={`Remove ${item.name}`}
                    >
                      <span aria-hidden className="text-[10px] font-bold leading-none">✕</span>
                    </button>
                    {/* Video badge */}
                    {item.kind === "video" && (
                      <span className="absolute bottom-1 left-1 rounded bg-abyss-950/70 px-1 py-0.5 text-[9px] font-medium text-lagoon-400">
                        VID
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit error */}
          {submitError ? (
            <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
              {submitError}
            </p>
          ) : null}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={[
              "w-full rounded-2xl py-3.5 font-semibold transition",
              isSubmitting
                ? "cursor-wait bg-abyss-800 text-slate-500"
                : "bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 text-abyss-950 shadow-glow hover:from-reef-400 hover:to-lagoon-500",
            ].join(" ")}
          >
            {isSubmitting ? "Submitting…" : "Submit sighting"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

function pickFromForm(lat: number, lng: number, zoneId: string): MapPick | null {
  if (lat === 0 && lng === 0) return null;
  return { lat, lng, zoneId: zoneId || null };
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
