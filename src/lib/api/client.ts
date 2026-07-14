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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
