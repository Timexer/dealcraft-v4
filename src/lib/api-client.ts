/**
 * API Client — Centralized fetch wrapper with error interception.
 *
 * Intercepts upstream error codes (e.g., 412 PreconditionFailed) and
 * redirects to a safe application-level context instead of dumping
 * raw JSON to the browser window.
 */
import { useGameStore } from '@/store/game-store';

export class ApiClientError extends Error {
  status: number;
  code: string;
  detail: unknown;

  constructor(status: number, code: string, detail: unknown) {
    super(`API Error ${status}: ${code}`);
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

/**
 * Safe fetch wrapper that intercepts error responses.
 *
 * - 412 PreconditionFailed → redirects to dashboard via store phase change
 * - 4xx/5xx → throws ApiClientError with structured info (no raw JSON in UI)
 */
export async function apiClient<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  // ── PreconditionFailed (412) Interceptor ──────────────────────────────
  // This typically occurs when a save/load transaction conflicts with the
  // current server state (e.g., stale version, concurrent modification).
  // Instead of showing raw JSON, redirect to the dashboard safely.
  if (response.status === 412) {
    // Attempt to parse the body for logging, but never display it
    try {
      const body = await response.json();
      console.warn('[ApiClient] 412 PreconditionFailed intercepted:', body);
    } catch {
      console.warn('[ApiClient] 412 PreconditionFailed intercepted (non-JSON body)');
    }

    // Redirect to dashboard via Zustand phase — no URL change needed
    // since the app uses single-page phase routing
    useGameStore.getState().setPhase('dashboard');

    // Return a safe empty object so callers don't crash
    return {} as T;
  }

  // ── Other error statuses ──────────────────────────────────────────────
  if (!response.ok) {
    let errorDetail: unknown = null;
    try {
      errorDetail = await response.json();
    } catch {
      errorDetail = await response.text().catch(() => null);
    }

    // Log the structured error for debugging, but never surface raw JSON
    console.error(
      `[ApiClient] ${response.status} ${response.statusText}:`,
      errorDetail,
    );

    throw new ApiClientError(
      response.status,
      response.statusText,
      errorDetail,
    );
  }

  return response.json() as Promise<T>;
}
