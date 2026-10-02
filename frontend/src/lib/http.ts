import { API_BASE_URL } from "@/lib/api";

type AccessTokenSession = {
  accessToken: string;
};

export type FetchNextOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export type FetchApiJsonOptions = {
  errorMessage: string;
  nullStatuses?: number[];
  cache?: RequestCache;
  next?: FetchNextOptions;
};

export async function fetchApiJson<T>(
  session: AccessTokenSession,
  path: string,
  { errorMessage, nullStatuses = [], cache = "no-store", next }: FetchApiJsonOptions
) {
  const requestInit: RequestInit & { next?: FetchNextOptions } = {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache
  };

  if (next) {
    requestInit.next = next;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestInit);

  if (nullStatuses.includes(response.status)) {
    return null as T;
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("SESSION_FORBIDDEN");
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}
