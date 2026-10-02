import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { getSessionUser, type InternalUserRole, type SessionUser } from "@/lib/auth";
import { getStudentPortalSessionUser, type StudentPortalSessionUser } from "@/lib/student-portal-auth";

type AccessTokenSession = Pick<SessionUser, "accessToken"> | Pick<StudentPortalSessionUser, "accessToken">;

type ProxyJsonOptions = {
  session: AccessTokenSession;
  path: string;
  method?: string;
  body?: unknown;
  extraHeaders?: Record<string, string>;
  errorMessage: string;
  successStatus?: number;
  passThroughErrorBody?: boolean;
};

type ProxyFormDataOptions = {
  session: AccessTokenSession;
  path: string;
  method?: string;
  formData: FormData;
  extraHeaders?: Record<string, string>;
  errorMessage: string;
  successStatus?: number;
};

type ProxyBinaryOptions = {
  session: AccessTokenSession;
  path: string;
  errorMessage: string;
};

function unauthorized(message: string) {
  return NextResponse.json({ message }, { status: 401 });
}

async function readBackendProblem(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { detail?: string };
  return payload.detail;
}

async function buildJsonResponse(response: Response, successStatus?: number) {
  const headers = new Headers();
  const cacheControl = response.headers.get("cache-control");
  if (cacheControl) {
    headers.set("Cache-Control", cacheControl);
  }

  if (response.status === 204) {
    return new NextResponse(null, { status: 204, headers });
  }

  const payload = await response.json().catch(() => null);

  if (payload === null) {
    return new NextResponse(null, { status: successStatus ?? response.status, headers });
  }

  return NextResponse.json(payload, { status: successStatus ?? response.status, headers });
}

export async function requireInternalApiSession(allowedRoles: InternalUserRole[], message: string) {
  const session = await getSessionUser();

  if (!session || !allowedRoles.includes(session.role)) {
    return unauthorized(message);
  }

  return session;
}

export async function requireStudentPortalApiSession(message: string) {
  const session = await getStudentPortalSessionUser();

  if (!session) {
    return unauthorized(message);
  }

  return session;
}

export async function proxyJsonToBackend({
  session,
  path,
  method = "GET",
  body,
  extraHeaders,
  errorMessage,
  successStatus,
  passThroughErrorBody = false
}: ProxyJsonOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...extraHeaders,
      Authorization: `Bearer ${session.accessToken}`
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    if (passThroughErrorBody) {
      const payload = await response.json().catch(() => ({}));
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(
      { message: (await readBackendProblem(response)) || errorMessage },
      { status: response.status }
    );
  }

  return buildJsonResponse(response, successStatus);
}

export async function proxyFormDataToBackend({
  session,
  path,
  method = "POST",
  formData,
  extraHeaders,
  errorMessage,
  successStatus
}: ProxyFormDataOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...extraHeaders,
      Authorization: `Bearer ${session.accessToken}`
    },
    body: formData,
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: (await readBackendProblem(response)) || errorMessage },
      { status: response.status }
    );
  }

  return buildJsonResponse(response, successStatus);
}

export async function proxyBinaryToBackend({ session, path, errorMessage }: ProxyBinaryOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return new Response(errorMessage, { status: response.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", response.headers.get("content-type") ?? "application/octet-stream");
  headers.set("Content-Disposition", response.headers.get("content-disposition") ?? "inline");

  const cacheControl = response.headers.get("cache-control");
  if (cacheControl) {
    headers.set("Cache-Control", cacheControl);
  }
  const etag = response.headers.get("etag");
  if (etag) {
    headers.set("ETag", etag);
  }
  const lastModified = response.headers.get("last-modified");
  if (lastModified) {
    headers.set("Last-Modified", lastModified);
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
