import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Layout } from "../components/Layout";
import { MapPicker, type MapPick } from "../components/MapPicker";
import { BEHAVIOR_OPTIONS, SPECIES_OPTIONS } from "../constants/fieldbook";
import { toDatetimeLocalValue } from "../lib/datetime";
import { fetchZones, submitSighting } from "../graphql/api";

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
  const queryClient = useQueryClient();
  const zonesQuery = useQuery({
    queryKey: ["zones"],
    queryFn: fetchZones,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
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

  const mutation = useMutation({
    mutationFn: submitSighting,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["mySightings"] });
    },
  });

  const [lat, lng] = [watch("latitude"), watch("longitude")];

  const onMapChange = (pick: MapPick) => {
    setValue("latitude", pick.lat, { shouldValidate: true });
    setValue("longitude", pick.lng, { shouldValidate: true });
    setValue("zoneId", pick.zoneId ?? "", { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    mutation.reset();
    await mutation.mutateAsync({
      latitude: values.latitude,
      longitude: values.longitude,
      species: values.species,
      count: values.count,
      behavior: values.behavior,
      observedAt: new Date(values.observedAt).toISOString(),
      comment: values.comment?.trim() || undefined,
      zoneId: values.zoneId || undefined,
    });
    reset({
      ...values,
      latitude: 0,
      longitude: 0,
      zoneId: "",
      observedAt: toDatetimeLocalValue(new Date().toISOString()),
      comment: "",
    });
  });

  return (
    <Layout title="Report">
      <div className="mt-2 space-y-5">
        <p className="text-sm text-slate-400">
          Tap the map to place your sighting in a coastal zone around Cozumel, then complete the
          form.
        </p>

        {zonesQuery.isPending ? (
          <div
            className="h-[min(52vh,22rem)] animate-pulse rounded-2xl bg-abyss-800/70"
            aria-busy
            aria-label="Loading map"
          />
        ) : null}

        {zonesQuery.isError ? (
          <p className="text-sm text-coral-300" role="alert">
            Could not load zones. Check your connection or the MSW mock.
          </p>
        ) : null}

        {zonesQuery.data ? (
          <MapPicker zones={zonesQuery.data} value={pickFromForm(lat, lng, watch("zoneId"))} onChange={onMapChange} />
        ) : null}

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

          {mutation.isError ? (
            <p className="text-sm text-coral-300" role="alert">
              Submission failed. Please try again.
            </p>
          ) : null}

          {mutation.isSuccess ? (
            <p className="rounded-xl border border-reef-500/30 bg-reef-500/10 px-3 py-2 text-sm text-reef-200">
              Sighting saved.{" "}
              <Link to="/history" className="font-medium underline">
                View history
              </Link>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={mutation.isPending || zonesQuery.isPending}
            className="w-full rounded-2xl bg-gradient-to-r from-reef-500 to-lagoon-600 py-3.5 font-semibold text-abyss-950 shadow-glow transition enabled:hover:from-reef-400 enabled:hover:to-lagoon-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Sending…" : "Submit sighting"}
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
