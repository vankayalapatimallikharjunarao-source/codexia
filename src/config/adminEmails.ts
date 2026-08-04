/**
 * Centralized Admin Email Whitelist Configuration for Codexia
 * Used for both client-side route guards and server-side RBAC validation.
 */

export const ADMIN_EMAILS: string[] = [
  "vankayalapatimallikharjunarao@gmail.com",
  "bestnest125@gmail.com"
];

export function isWhitelistedAdminEmail(emailStr?: string | null): boolean {
  if (!emailStr) return false;
  const emailLower = emailStr.toLowerCase().trim();

  // Check exact email list matches
  if (ADMIN_EMAILS.some((admin) => admin.toLowerCase() === emailLower)) {
    return true;
  }

  // Check environment variable ADMIN_EMAILS if set
  if (typeof process !== "undefined" && process.env?.ADMIN_EMAILS) {
    const envList = process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase());
    if (envList.includes(emailLower)) {
      return true;
    }
  }

  // Domain match check
  if (emailLower.endsWith("@codexiaindia.com")) {
    return true;
  }

  return false;
}

export default ADMIN_EMAILS;
