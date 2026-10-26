export const EVENT_TITLE = "Decarbonization and Energy Efficiency in Midstream Gas Operations";
export const SPEAKER_NAME = "Dr. Zeinab Ibrahim";
/** Display strings for the announced date/time. Set to null to fall back to the "announced soon" line. */
export const EVENT_SCHEDULE: { en: string; ar: string } | null = {
  en: "Monday, October 26, 2026 · 8:00 PM",
  ar: "الاثنين 26 أكتوبر 2026 · 8:00 مساءً",
};

/** Flip to false to reopen sign-ups: the form, the hero button and the server guard all follow this flag. */
export const REGISTRATION_CLOSED = true;

/** Whether new sign-ups are accepted. The server function refuses inserts when this is false. */
export function allowNewRegistration(): boolean {
  return !REGISTRATION_CLOSED;
}

/** What the /register page shows: the sign-up form, or the closed notice with a link to code recovery. */
export function registerPageMode(): "form" | "closed" {
  return allowNewRegistration() ? "form" : "closed";
}
