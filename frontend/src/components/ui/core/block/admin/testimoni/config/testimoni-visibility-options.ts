/**
 * Filter + form options for the Testimoni visibility enum — values mirror
 * the backend enum exactly (`TestimoniVisibilityEnum`: public|private).
 */
export const TESTIMONI_VISIBILITY_OPTIONS = [
  { value: "public", label: "Publik" },
  { value: "private", label: "Privat" },
] as const

export const TESTIMONI_VISIBILITY_LABELS: Record<string, string> = {
  public: "Publik",
  private: "Privat",
}
