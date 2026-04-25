import type { CreateStudentProgressEntryPayload } from "@/lib/clinical";

export function buildProgressEntryPayload(formData: FormData): CreateStudentProgressEntryPayload {
  const recordedAtValue = String(formData.get("recordedAt") ?? "");

  return {
    recordedAt: new Date(recordedAtValue).toISOString(),
    instructorNotes: String(formData.get("instructorNotes") ?? "").trim(),
    flexibilityScore: Number(formData.get("flexibilityScore") ?? 0),
    strengthScore: Number(formData.get("strengthScore") ?? 0),
    painLevel: Number(formData.get("painLevel") ?? 0)
  };
}

export function getOptionalProgressEntryAttachment(formData: FormData) {
  const attachment = formData.get("attachment");
  return attachment instanceof File && attachment.size > 0 ? attachment : null;
}
