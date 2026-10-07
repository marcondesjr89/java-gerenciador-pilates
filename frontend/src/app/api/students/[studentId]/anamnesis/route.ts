import { proxyJsonToBackend, requireInternalApiSession } from "@/app/api/_lib/proxy";
import { badRequest, readJsonBody, readTrimmedString } from "@/app/api/_lib/validation";

type RouteContext = {
  params: Promise<{ studentId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireInternalApiSession(
    ["ADMIN", "INSTRUCTOR"],
    "Sessao invalida para salvar anamnese do aluno."
  );

  if (session instanceof Response) {
    return session;
  }

  const { studentId } = await context.params;
  if (!studentId?.trim()) {
    return badRequest("Identificador do aluno nao informado.");
  }

  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const body = bodyResult.data as {
    hasPathologies?: unknown;
    pathologyDetails?: unknown;
    hasSurgeries?: unknown;
    surgeryDetails?: unknown;
    hasPain?: unknown;
    painDetails?: unknown;
    hasHypertension?: unknown;
    hasOsteoporosis?: unknown;
    isPregnant?: unknown;
    medicalClearanceRequired?: unknown;
    generalObservations?: unknown;
  };

  const hasPathologies = Boolean(body.hasPathologies);
  const pathologyDetails = readTrimmedString(body.pathologyDetails);
  const hasSurgeries = Boolean(body.hasSurgeries);
  const surgeryDetails = readTrimmedString(body.surgeryDetails);
  const hasPain = Boolean(body.hasPain);
  const painDetails = readTrimmedString(body.painDetails);
  const hasHypertension = Boolean(body.hasHypertension);
  const hasOsteoporosis = Boolean(body.hasOsteoporosis);
  const isPregnant = Boolean(body.isPregnant);
  const medicalClearanceRequired = Boolean(body.medicalClearanceRequired);
  const generalObservations = readTrimmedString(body.generalObservations);

  if (hasPathologies && !pathologyDetails) {
    return badRequest("Informe os detalhes das patologias quando o campo estiver marcado.");
  }

  if (hasSurgeries && !surgeryDetails) {
    return badRequest("Informe os detalhes das cirurgias quando o campo estiver marcado.");
  }

  if (hasPain && !painDetails) {
    return badRequest("Informe os detalhes da dor quando o campo estiver marcado.");
  }

  return proxyJsonToBackend({
    session,
    path: `/api/v1/students/${studentId}/anamnesis`,
    method: "PUT",
    body: {
      hasPathologies,
      pathologyDetails: pathologyDetails || null,
      hasSurgeries,
      surgeryDetails: surgeryDetails || null,
      hasPain,
      painDetails: painDetails || null,
      hasHypertension,
      hasOsteoporosis,
      isPregnant,
      medicalClearanceRequired,
      generalObservations: generalObservations || null
    },
    errorMessage: "Nao foi possivel salvar a anamnese do aluno."
  });
}
