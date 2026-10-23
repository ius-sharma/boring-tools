export const ADMIN_EMAILS: string[] = [
  "ayush.128179@marwadiuniversity.ac.in",
  (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
  (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase().trim(),
].filter(Boolean);

/**
 * Checks if a given email belongs to the whitelisted admin
 */
export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase().trim() === normalized);
}
