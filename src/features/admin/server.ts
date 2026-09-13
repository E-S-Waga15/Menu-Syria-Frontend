import { ApiError } from "@/lib/api/client";
import { redirect } from "next/navigation";

import { getSessionAccessToken } from "@/lib/api/server-auth";

/**
 * Runs a console page's data fetching with the cookie-backed access
 * token, bailing to the login screen on 401: an SSR 401 means the
 * session is missing/expired, and a server render of a stranger should
 * never surface as a 500.
 *
 * Server-only module — it transitively imports `next/headers`, so only
 * server components (the admin pages) may import it. Client components
 * keep fetching through `features/admin/services` directly, which
 * authenticates from localStorage.
 */
export async function fetchAdminPage<T>(
  lang: string,
  fetcher: (accessToken: string | null) => Promise<T>,
): Promise<T> {
  const accessToken = await getSessionAccessToken();
  try {
    return await fetcher(accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect(`/${lang}/admin/login`);
    }
    throw err;
  }
}
