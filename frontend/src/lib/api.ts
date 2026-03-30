export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  email: string;
  role: string;
};

export type AuthenticatedUserResponse = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  specialties: string[];
  active: boolean;
  createdAt: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel autenticar com a API.");
  }

  return response.json() as Promise<LoginResponse>;
}
