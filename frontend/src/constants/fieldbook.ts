/** Libellés « carnet de terrain » — alignés sur les enums côté API quand c’est possible. */

export const SPECIES_OPTIONS = [
  { value: "white_shark", label: "Grand requin blanc" },
  { value: "bull_shark", label: "Requin taureau" },
  { value: "nurse_shark", label: "Requin nourrice" },
  { value: "whale_shark", label: "Requin-baleine" },
  { value: "caribbean_reef_shark", label: "Requin de récif des Caraïbes" },
  { value: "unknown", label: "Espèce non identifiée" },
] as const;

export const BEHAVIOR_OPTIONS = [
  { value: "feeding", label: "Alimentation" },
  { value: "migrating", label: "Migration / déplacement" },
  { value: "resting", label: "Au repos" },
  { value: "playing", label: "Comportement social / jeu" },
  { value: "hunting", label: "Chasse" },
  { value: "stranded", label: "Échouage / détresse" },
  { value: "unknown", label: "Non observé" },
] as const;

export function speciesLabel(value: string): string {
  return SPECIES_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function behaviorLabel(value: string): string {
  return BEHAVIOR_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
