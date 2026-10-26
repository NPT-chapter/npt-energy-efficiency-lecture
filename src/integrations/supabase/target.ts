export const SUPABASE_PROJECT_REF = "oommaxeryywwclmlhcjh";
export const EXPECTED_SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

export function isExpectedSupabaseUrl(value: string | undefined): boolean {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === `${SUPABASE_PROJECT_REF}.supabase.co` &&
      !url.port &&
      !url.username &&
      !url.password &&
      (url.pathname === "/" || url.pathname === "") &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function resolveClientSupabaseUrl(configuredUrl: string | undefined): string {
  if (isExpectedSupabaseUrl(configuredUrl)) return EXPECTED_SUPABASE_URL;

  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL does not match the approved project. Client requests are pinned to the approved project until configuration is corrected.",
  );
  return EXPECTED_SUPABASE_URL;
}

export function requireTargetSupabaseUrl(configuredUrl: string | undefined): string {
  if (!configuredUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!isExpectedSupabaseUrl(configuredUrl)) {
    throw new Error("Supabase URL does not match the approved project; request blocked.");
  }

  return EXPECTED_SUPABASE_URL;
}
