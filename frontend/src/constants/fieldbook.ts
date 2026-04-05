/**
 * Field notebook — labels and form options.
 * Values must match `Species` / `Behavior` in `graphql/enums.ts` (GraphQL + REST API).
 */

import { Behavior, Species } from "../graphql/enums";

export { Behavior, Species };

/** Order used in report form & display. */
export const SPECIES_VALUES = [
  Species.NURSE_SHARK,
  Species.CARIBBEAN_REEF_SHARK,
  Species.GREAT_HAMMERHEAD_SHARK,
  Species.HAMMERHEAD_SHARK,
  Species.BULL_SHARK,
  Species.TIGER_SHARK,
  Species.UNKNOWN,
] as const;

export const BEHAVIOR_VALUES = [
  Behavior.FEEDING,
  Behavior.MIGRATING,
  Behavior.RESTING,
  Behavior.MATING,
  Behavior.HUNTING,
  Behavior.STRANDED,
  Behavior.UNKNOWN,
] as const;

const SPECIES_LABELS: Record<Species, string> = {
  [Species.NURSE_SHARK]: "Nurse shark",
  [Species.CARIBBEAN_REEF_SHARK]: "Caribbean reef shark",
  [Species.GREAT_HAMMERHEAD_SHARK]: "Great hammerhead shark",
  [Species.HAMMERHEAD_SHARK]: "Hammerhead shark",
  [Species.BULL_SHARK]: "Bull shark",
  [Species.TIGER_SHARK]: "Tiger shark",
  [Species.UNKNOWN]: "Unidentified species",
};

const BEHAVIOR_LABELS: Record<Behavior, string> = {
  [Behavior.FEEDING]: "Feeding",
  [Behavior.MIGRATING]: "Migrating / traveling",
  [Behavior.RESTING]: "Resting",
  [Behavior.MATING]: "Mating",
  [Behavior.HUNTING]: "Hunting",
  [Behavior.STRANDED]: "Stranded / distress",
  [Behavior.UNKNOWN]: "Not observed",
};

export const SPECIES_OPTIONS = SPECIES_VALUES.map((value) => ({
  value,
  label: SPECIES_LABELS[value],
}));

export const BEHAVIOR_OPTIONS = BEHAVIOR_VALUES.map((value) => ({
  value,
  label: BEHAVIOR_LABELS[value],
}));

export function speciesLabel(value: string): string {
  if (Object.values(Species).includes(value as Species)) {
    return SPECIES_LABELS[value as Species];
  }
  return value;
}

export function behaviorLabel(value: string): string {
  if (Object.values(Behavior).includes(value as Behavior)) {
    return BEHAVIOR_LABELS[value as Behavior];
  }
  return value;
}
