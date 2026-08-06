import { API_BASE_URL } from "~/lib/config";
import { getAdminToken } from "./auth-token";
import { ApiError, type ApiErrorBody } from "./errors";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
  auth?: boolean;
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Accept-Language", "ru");

  if (options.body !== undefined && !options.formData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getAdminToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetchRaw(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(options),
    body:
      options.formData ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
    signal: options.signal,
  });
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await apiFetchRaw(path, options);
  } catch (cause) {
    throw new ApiError(503, {
      code: "BACKEND_UNAVAILABLE",
      title: "Сервис недоступен",
      description: cause instanceof Error ? cause.message : "Backend недоступен",
    });
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
