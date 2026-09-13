/**
 * Name of the cookie that mirrors the access token for server-side
 * reads. Shared by the client writers below and the server reader in
 * `lib/api/server-auth.ts`, so both halves always address the same jar.
 */
export const SESSION_COOKIE = "menu-syria-access-token";

/**
 * Mirror of the access token the connected logins write alongside the
 * zustand-persisted store: server components can read a cookie where
 * localStorage is out of reach, so SSR-time data fetching authenticates
 * exactly like the browser flow. Not httpOnly — it carries the same
 * token already readable in localStorage, so it adds no exposure.
 */
export function writeSessionCookie(accessToken: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${accessToken}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
