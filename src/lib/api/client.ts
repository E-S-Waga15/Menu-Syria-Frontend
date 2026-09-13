/**
 * Unified API client. While the backend is not connected
 * (NEXT_PUBLIC_API_URL is empty) every service resolves from mock data —
 * swapping to the real API is a matter of setting the env variable.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const IS_MOCK = API_BASE_URL === "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  { body, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const authHeaders: HeadersInit = {};
  if (typeof window !== "undefined") {
    const persistedSession = window.localStorage.getItem("menu-syria-session");
    if (persistedSession) {
      try {
        const parsed = JSON.parse(persistedSession) as {
          state?: { accessToken?: string | null };
        };
        const accessToken = parsed.state?.accessToken;
        if (accessToken) {
          authHeaders.Authorization = `Bearer ${accessToken}`;
        }
      } catch {
        // Ignore an unreadable persisted session and make the request unauthenticated.
      }
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  return response.json() as Promise<T>;
}

/** Simulates network latency so loading states stay honest during mock mode. */
export function mockDelay<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/**
 * GET that resolves to `undefined` on a 404 instead of throwing.
 *
 * Services whose pages render `notFound()` when an entity is missing (a
 * restaurant by slug, a store catalog, an agent…) route through this so a
 * missing row becomes a clean 404 page rather than a 500.
 */
export async function apiGetOrUndefined<T>(path: string): Promise<T | undefined> {
  try {
    return await apiFetch<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined;
    throw err;
  }
}
