import { NextResponse } from "next/server";

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

type ValidationFailure = {
  success: false;
  response: Response;
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export async function readJsonBody(request: Request): Promise<ValidationResult<unknown>> {
  try {
    return {
      success: true,
      data: await request.json()
    };
  } catch {
    return {
      success: false,
      response: badRequest("Corpo da requisicao invalido.")
    };
  }
}

export async function readFormDataBody(request: Request): Promise<ValidationResult<FormData>> {
  try {
    return {
      success: true,
      data: await request.formData()
    };
  } catch {
    return {
      success: false,
      response: badRequest("Corpo multipart invalido.")
    };
  }
}

export function readTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function requireRouteParam(value: string, message: string) {
  return value.trim() ? null : badRequest(message);
}

export function isPositiveDecimal(value: string) {
  return /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0;
}

export function isPositiveInteger(value: unknown) {
  return Number.isInteger(value) && Number(value) > 0;
}

export function isIntegerInRange(value: unknown, minimum: number, maximum: number) {
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum;
}

export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoDateTime(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isOneOf<T extends string>(value: string, allowed: readonly T[]): value is T {
  return allowed.includes(value as T);
}

export function isNonEmptyFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function hasAllowedFileType(file: File, allowedContentTypes: readonly string[]) {
  return allowedContentTypes.includes((file.type || "application/octet-stream").toLowerCase());
}
