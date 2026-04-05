import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { MapPicker, type MapPick } from "../components/MapPicker";
import { BEHAVIOR_OPTIONS, SPECIES_OPTIONS } from "../constants/fieldbook";
import { MARINE_ZONES } from "../data/marineZones";
import { useAuth } from "../hooks/useAuth";
import { submitSightingToApi } from "../lib/api";
import { toDatetimeLocalValue } from "../lib/datetime";
import { SUBMIT_ZONE_LAND_GEOJSON } from "../data/submitZoneLandGeoJSON";
import { isOnLand } from "../lib/landValidator";

const speciesValues = SPECIES_OPTIONS.map((o) => o.value) as [string, ...string[]];
const behaviorValues = BEHAVIOR_OPTIONS.map((o) => o.value) as [string, ...string[]];

const formSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    zoneId: z.string(),
    species: z.enum(speciesValues),
    count: z.coerce.number().int().min(1).max(99),
    behavior: z.enum(behaviorValues),
    observedAt: z.string().min(1, "Date et heure requises"),
    comment: z.string().optional(),
  })
  .refine((d) => d.latitude !== 0 || d.longitude !== 0, {
    message: "Tapez sur la carte pour placer votre observation.",
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
      species: "unknown",
      count: 1,
      behavior: "unknown",
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
    if (isOnLand(pick.lng, pick.lat, SUBMIT_ZONE_LAND_GEOJSON.features)) {
      setLandError("Ce point est sur la terre. Placez le marqueur en mer.");
    } else {
      setLandError(null);
    }
  };

  const [landError, setLandError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    if (landError) return;
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
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de la soumission.");
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
    <Layout title="Signaler">
      <div className="mt-2 space-y-5">

        {/* ── Instruction contextuelle ─────────────────────── */}
        <p className="text-sm text-slate-400">
          Placez un marqueur sur la zone où vous avez observé un requin à{" "}
          <strong className="text-foam">Cozumel</strong>, puis complétez
          le formulaire.
        </p>

        {/* ── Carte Isla Cozumel ───────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-lagoon-500/25 bg-abyss-850/50">
          {/* En-tête de la carte */}
          <div className="flex items-center justify-between border-b border-lagoon-500/15 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {/* Icône localisation */}
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
            {/* Zone sélectionnée */}
            {selectedZone ? (
              <span className="flex items-center gap-1 rounded-lg bg-reef-500/15 px-2 py-0.5 text-xs font-medium text-reef-300">
                <span className="h-1.5 w-1.5 rounded-full bg-reef-400" aria-hidden />
                {selectedZone.name}
              </span>
            ) : (
              <span className="text-xs text-slate-600">Aucune zone sélectionnée</span>
            )}
          </div>
          {/* Carte Leaflet — zones libres, pas de polygones contraignants */}
          <MapPicker
            zones={[]}
            value={pickFromForm(lat, lng, zoneId)}
            onChange={onMapChange}
          />
        </div>

        {/* ── Formulaire ──────────────────────────────────── */}
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("zoneId")} />

          {landError ? (
            <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-3 py-2.5 text-sm text-coral-300" role="alert">
              {landError}
            </p>
          ) : errors.latitude ? (
            <p className="text-sm text-coral-400" role="alert">
              {errors.latitude.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-400">Espèce (estimation)</span>
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
              <span className="text-slate-400">Nombre d'individus</span>
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
            <span className="text-slate-400">Comportement observé</span>
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
            <span className="text-slate-400">Date et heure de l'observation</span>
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
            <span className="text-slate-400">Notes de terrain (optionnel)</span>
            <textarea
              rows={3}
              placeholder="Profondeur, visibilité, autres espèces à proximité…"
              className="mt-1 w-full resize-none rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 placeholder:text-slate-600 focus:ring-2"
              {...register("comment")}
            />
          </label>

          {/* ── Section médias ──────────────────────────────── */}
          <div className="block text-sm">
            <span className="text-slate-400">Photos / Vidéos (optionnel)</span>
            {/*
             * TODO (backend): mediaUrl accepts a single IPFS URL string.
             * Multi-file upload to IPFS must be implemented separately.
             * Currently the selected files are only previewed locally and
             * are NOT sent to the backend.
             */}

            {/* Trigger d'ajout de fichiers */}
            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lagoon-500/30 bg-abyss-900/60 px-4 py-3 transition hover:border-lagoon-500/50 hover:bg-abyss-900/80">
              <CameraIcon className="h-5 w-5 shrink-0 text-lagoon-400" />
              <span className="text-slate-400">
                Ajouter des photos ou vidéos
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="sr-only"
                onChange={handleMediaAdd}
              />
            </label>

            {/* Grille de previews */}
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
                    {/* Bouton de suppression */}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-abyss-950/80 text-slate-300 transition hover:bg-coral-500/80 hover:text-white"
                      aria-label={`Supprimer ${item.name}`}
                    >
                      <span aria-hidden className="text-[10px] font-bold leading-none">✕</span>
                    </button>
                    {/* Badge vidéo */}
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

          {/* ── Erreur de soumission ─────────────────────────── */}
          {submitError ? (
            <p className="rounded-xl border border-coral-500/30 bg-coral-500/10 px-4 py-3 text-sm text-coral-300" role="alert">
              {submitError}
            </p>
          ) : null}

          {/* ── Bouton submit ────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting || !!landError}
            className={[
              "w-full rounded-2xl py-3.5 font-semibold transition",
              isSubmitting || landError
                ? "cursor-not-allowed bg-abyss-800 text-slate-500"
                : "bg-gradient-to-r from-reef-500/90 to-lagoon-600/90 text-abyss-950 shadow-glow hover:from-reef-400 hover:to-lagoon-500",
            ].join(" ")}
          >
            {isSubmitting ? "Envoi en cours…" : "Soumettre l'observation"}
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
