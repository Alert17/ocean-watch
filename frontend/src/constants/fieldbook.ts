/** Field notebook labels — aligned with API enums where possible. */

export const SPECIES_OPTIONS = [
  { value: "white_shark", label: "Great white shark" },
  { value: "bull_shark", label: "Bull shark" },
  { value: "nurse_shark", label: "Nurse shark" },
  { value: "whale_shark", label: "Whale shark" },
  { value: "caribbean_reef_shark", label: "Caribbean reef shark" },
  { value: "unknown", label: "Unidentified species" },
] as const;

export const BEHAVIOR_OPTIONS = [
  { value: "feeding", label: "Feeding" },
  { value: "migrating", label: "Migrating / traveling" },
  { value: "resting", label: "Resting" },
  { value: "playing", label: "Social / play" },
  { value: "hunting", label: "Hunting" },
  { value: "stranded", label: "Stranded / distress" },
  { value: "unknown", label: "Not observed" },
] as const;

export function speciesLabel(value: string): string {
  return SPECIES_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function behaviorLabel(value: string): string {
  return BEHAVIOR_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
