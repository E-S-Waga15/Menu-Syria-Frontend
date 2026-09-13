import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session-cookie";

/**
 * Server-side read of the access token mirrored into a cookie by every
 * connected login. Server components call this (transitively through
 * `features/admin/server.ts`) so SSR-time `apiFetch` requests can carry
 * the same Authorization header the browser flow builds from localStorage.
 *
 * Server-only module: it statically imports `next/headers`, so it must
 * never be imported from a client component — client callers get their
 * token from `getStoredAccessToken()` instead.
 */
export async function getSessionAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
