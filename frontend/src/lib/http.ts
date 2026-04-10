import { API_BASE_URL } from "@/lib/api";

type AccessTokenSession = {
  accessToken: string;
};

type FetchApiJsonOptions = {
  errorMessage: string;
  nullStatuses?: number[];
};

export async function fetchApiJson<T>(
  session: AccessTokenSession,
  path: string,
  { errorMessage, nullStatuses = [] }: FetchApiJsonOptions
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

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
