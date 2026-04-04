import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { MapPicker, type MapPick } from "../components/MapPicker";
import { BEHAVIOR_OPTIONS, SPECIES_OPTIONS } from "../constants/fieldbook";
import { MARINE_ZONES } from "../data/marineZones";
import { toDatetimeLocalValue } from "../lib/datetime";

const speciesValues = SPECIES_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];
const behaviorValues = BEHAVIOR_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

const formSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    zoneId: z.string(),
    species: z.enum(speciesValues),
    count: z.coerce.number().int().min(1).max(99),
    behavior: z.enum(behaviorValues),
    observedAt: z.string().min(1, "Date and time required"),
    comment: z.string().optional(),
  })
  .refine((d) => d.zoneId.length > 0, {
    message:
      "Tap the map inside a zone (turquoise highlight) to set your position.",
    path: ["zoneId"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ReportPage() {
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

  const [lat, lng] = [watch("latitude"), watch("longitude")];

  const onMapChange = (pick: MapPick) => {
    setValue("latitude", pick.lat, { shouldValidate: true });
    setValue("longitude", pick.lng, { shouldValidate: true });
    setValue("zoneId", pick.zoneId ?? "", { shouldValidate: true });
  };

  const onSubmit = handleSubmit(() => {
    /* Indexer has no mutations — form is UI-only. */
  });

  return (
    <Layout title="Report">
      <div className="mt-2 space-y-5">
        <div
          className="rounded-2xl border border-lagoon-500/25 bg-abyss-850/70 px-4 py-3 text-sm text-slate-300"
          role="note"
        >
          The{" "}
          <a
            href="https://indexer.oceanwatch.xyz/graphql"
            className="text-lagoon-400 underline"
            target="_blank"
            rel="noreferrer"
          >
            indexer GraphQL API
          </a>{" "}
          is <strong className="text-foam">read-only</strong> (queries{" "}
          <code className="text-reef-300">sightings</code> /{" "}
          <code className="text-reef-300">sighting</code> only). New records are not submitted
          from this page. Browse confirmed sightings under{" "}
          <Link to="/history" className="font-medium text-reef-300 underline">
            History
          </Link>
          .
        </div>

        <p className="text-sm text-slate-400">
          Practice placing a pin in a coastal zone around Cozumel (zones are local to this app,
          not from the indexer).
        </p>

        <MapPicker
          zones={MARINE_ZONES}
          value={pickFromForm(lat, lng, watch("zoneId"))}
          onChange={onMapChange}
        />

        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" {...register("latitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("longitude", { valueAsNumber: true })} />
          <input type="hidden" {...register("zoneId")} />

          {errors.zoneId ? (
            <p className="text-sm text-coral-300" role="alert">
              {errors.zoneId.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-400">Species (best estimate)</span>
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
            <span className="text-slate-400">Date & time of sighting</span>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-lagoon-500/25 bg-abyss-900/80 px-3 py-2.5 text-foam outline-none ring-reef-400/40 focus:ring-2"
              {...register("observedAt")}
            />
            {errors.observedAt ? (
              <span className="mt-1 block text-xs text-coral-300">
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

          <button
            type="submit"
            disabled
            className="w-full cursor-not-allowed rounded-2xl border border-slate-600 bg-abyss-800 py-3.5 font-semibold text-slate-500"
            title="Indexer has no GraphQL mutations"
          >
            Submit unavailable — indexer is read-only
          </button>
        </form>
      </div>
    </Layout>
  );
}

function pickFromForm(
  lat: number,
  lng: number,
  zoneId: string,
): MapPick | null {
  if (!lat && !lng) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng, zoneId: zoneId || null };
}
