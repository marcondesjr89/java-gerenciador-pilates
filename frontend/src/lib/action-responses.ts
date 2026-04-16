export type ActionErrorResponse = {
  message?: string;
};

export type ResourceIdResponse = {
  id: string;
};

export async function readActionErrorMessage(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => ({ message: "" }))) as ActionErrorResponse;
  return payload.message || fallbackMessage;
}
