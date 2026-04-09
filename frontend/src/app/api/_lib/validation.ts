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

export function readTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function isPositiveDecimal(value: string) {
  return /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0;
}

export function isPositiveInteger(value: unknown) {
  return Number.isInteger(value) && Number(value) > 0;
}

export function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoDateTime(value: string) {
  return !Number.isNaN(Date.parse(value));
}
