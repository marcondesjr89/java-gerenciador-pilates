import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as createStudent } from "@/app/api/students/route";
import { POST as createPortalAccount } from "@/app/api/students/[studentId]/portal-account/route";
import { POST as createProgressEntry } from "@/app/api/students/[studentId]/progress-entries/route";
import { POST as createLegalAcceptance } from "@/app/api/students/[studentId]/legal-acceptances/route";
import { POST as uploadClinicalAttachment } from "@/app/api/students/[studentId]/progress-entries/[progressEntryId]/attachments/route";
import { GET as downloadLegalAttachment } from "@/app/api/students/[studentId]/legal-acceptances/[acceptanceId]/attachments/[attachmentId]/download/route";
import { GET as downloadLegalAcceptanceDocument } from "@/app/api/students/[studentId]/legal-acceptances/[acceptanceId]/document/download/route";
import type { CreateStudentProgressEntryPayload } from "@/lib/clinical";

const requireInternalApiSessionMock = vi.fn();
const proxyJsonToBackendMock = vi.fn();
const proxyFormDataToBackendMock = vi.fn();
const proxyBinaryToBackendMock = vi.fn();

vi.mock("@/app/api/_lib/proxy", () => ({
  requireInternalApiSession: (...args: unknown[]) => requireInternalApiSessionMock(...args),
  proxyJsonToBackend: (...args: unknown[]) => proxyJsonToBackendMock(...args),
  proxyFormDataToBackend: (...args: unknown[]) => proxyFormDataToBackendMock(...args),
  proxyBinaryToBackend: (...args: unknown[]) => proxyBinaryToBackendMock(...args)
}));

describe("student api routes", () => {
  const validProgressEntryPayload: CreateStudentProgressEntryPayload = {
    recordedAt: "2026-04-10T12:00:00.000Z",
    instructorNotes: "Evolucao ok",
    flexibilityScore: 70,
    strengthScore: 80,
    painLevel: 3
  };

  beforeEach(() => {
    requireInternalApiSessionMock.mockReset();
    proxyJsonToBackendMock.mockReset();
    proxyFormDataToBackendMock.mockReset();
    proxyBinaryToBackendMock.mockReset();
  });

  it("retorna 400 quando o cadastro do aluno chega com CPF invalido", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createStudent(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: "Aluno Teste",
          cpf: "123",
          email: "aluno@studio.com",
          phoneNumber: "85999999999",
          birthDate: "1990-01-01",
          status: "ACTIVE",
          lgpdConsent: true
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe um CPF valido com 11 digitos." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha cadastro do aluno com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "student-1" }), { status: 201 }));

    await createStudent(
      new Request("http://localhost/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: "  Aluno Teste  ",
          cpf: "12345678901",
          email: "  aluno@studio.com ",
          phoneNumber: " 85999999999 ",
          birthDate: "1990-01-01",
          status: "ACTIVE",
          lgpdConsent: true
        })
      })
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students",
      method: "POST",
      body: {
        fullName: "Aluno Teste",
        cpf: "12345678901",
        email: "aluno@studio.com",
        phoneNumber: "85999999999",
        birthDate: "1990-01-01",
        status: "ACTIVE",
        lgpdConsent: true
      },
      errorMessage: "Nao foi possivel cadastrar o aluno.",
      successStatus: 201
    });
  });

  it("retorna 400 quando a conta do portal chega com senha curta", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createPortalAccount(
      new Request("http://localhost/api/students/student-1/portal-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "aluno@studio.com",
          password: "1234567"
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Informe uma senha valida com pelo menos 8 caracteres."
    });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha configuracao da conta do portal com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await createPortalAccount(
      new Request("http://localhost/api/students/student-1/portal-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: " aluno@studio.com ",
          password: "12345678"
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/portal-account",
      method: "POST",
      body: {
        email: "aluno@studio.com",
        password: "12345678"
      },
      errorMessage: "Nao foi possivel configurar a conta do portal."
    });
  });

  it("retorna 400 quando a evolucao chega com dor fora da faixa", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await createProgressEntry(
      new Request("http://localhost/api/students/student-1/progress-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...validProgressEntryPayload,
          painLevel: 11
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe uma dor valida entre 0 e 10." });
    expect(proxyJsonToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha evolucao com payload validado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyJsonToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "entry-1" }), { status: 200 }));

    await createProgressEntry(
      new Request("http://localhost/api/students/student-1/progress-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...validProgressEntryPayload,
          instructorNotes: "  Evolucao ok  "
        })
      }),
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(proxyJsonToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/progress-entries",
      method: "POST",
      body: validProgressEntryPayload,
      errorMessage: "Nao foi possivel registrar a evolucao."
    });
  });

  it("retorna 400 quando o multipart do termo legal chega sem payload request", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const formData = new FormData();
    formData.set("tabletSignatureFile", new File(["img"], "assinatura.png", { type: "image/png" }));
    const request = new Request("http://localhost/api/students/student-1/legal-acceptances", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=test"
      }
    });
    vi.spyOn(request, "formData").mockResolvedValue(formData);

    const response = await createLegalAcceptance(
      request,
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o payload do termo legal." });
    expect(proxyFormDataToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha aceite legal multipart com payload normalizado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyFormDataToBackendMock.mockResolvedValue(new Response(JSON.stringify({ id: "acceptance-1" }), { status: 201 }));

    const formData = new FormData();
    formData.set(
      "request",
      new Blob(
          [
            JSON.stringify({
              termType: "LGPD_DATA_PROCESSING",
              coveredTermTypes: ["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"],
              title: "  Termo LGPD  ",
              termsVersion: "  v1.0-abr-2026 ",
            legalBasis: "  Consentimento  ",
            termBody: "  Texto do termo  ",
            status: "ACCEPTED",
            collectionMethod: "TABLET_SIGNATURE",
            evidenceNote: "  Coletado na recepcao  "
          })
        ],
        { type: "application/json" }
      )
    );
    formData.set("tabletSignatureFile", new File(["img"], "assinatura.png", { type: "image/png" }));
    const request = new Request("http://localhost/api/students/student-1/legal-acceptances", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data; boundary=test"
      }
    });
    vi.spyOn(request, "formData").mockResolvedValue(formData);

    await createLegalAcceptance(
      request,
      {
        params: Promise.resolve({ studentId: "student-1" })
      }
    );

    expect(proxyFormDataToBackendMock).toHaveBeenCalledTimes(1);
    const [call] = proxyFormDataToBackendMock.mock.calls[0] as [
      {
        session: { accessToken: string };
        path: string;
        formData: FormData;
        errorMessage: string;
        extraHeaders: Record<string, string>;
      }
    ];

    expect(call.session).toEqual({ accessToken: "internal-token" });
    expect(call.path).toBe("/api/v1/students/student-1/legal-acceptances");
    expect(call.errorMessage).toBe("Nao foi possivel registrar o termo legal.");
    expect(call.extraHeaders).toMatchObject({
      "X-GP-Collection-Origin": "internal-web-desktop"
    });

    const requestPart = call.formData.get("request");
    expect(requestPart).toBeInstanceOf(Blob);
    await expect((requestPart as Blob).text()).resolves.toBe(
      JSON.stringify({
        termType: "LGPD_DATA_PROCESSING",
        coveredTermTypes: ["LGPD_DATA_PROCESSING", "WHATSAPP_COMMUNICATION"],
        title: "Termo LGPD",
        termsVersion: "v1.0-abr-2026",
        legalBasis: "Consentimento",
        termBody: "Texto do termo",
        status: "ACCEPTED",
        collectionMethod: "TABLET_SIGNATURE",
        evidenceNote: "Coletado na recepcao"
      })
    );
    expect(call.formData.get("tabletSignatureFile")).toBeInstanceOf(File);
  });

  it("retorna 400 quando o anexo clinico chega sem arquivo", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    const request = new Request("http://localhost/api/students/student-1/progress-entries/entry-1/attachments", {
      method: "POST"
    });
    vi.spyOn(request, "formData").mockResolvedValue(new FormData());

    const response = await uploadClinicalAttachment(
      request,
      {
        params: Promise.resolve({ studentId: "student-1", progressEntryId: "entry-1" })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Arquivo clinico nao informado." });
    expect(proxyFormDataToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha o anexo clinico validado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyFormDataToBackendMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));

    const formData = new FormData();
    formData.set("file", new File(["pdf"], "evolucao.pdf", { type: "application/pdf" }));
    const request = new Request("http://localhost/api/students/student-1/progress-entries/entry-1/attachments", {
      method: "POST"
    });
    vi.spyOn(request, "formData").mockResolvedValue(formData);

    await uploadClinicalAttachment(
      request,
      {
        params: Promise.resolve({ studentId: "student-1", progressEntryId: "entry-1" })
      }
    );

    expect(proxyFormDataToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/progress-entries/entry-1/attachments",
      formData: expect.any(FormData),
      errorMessage: "Nao foi possivel anexar o arquivo clinico."
    });
  });

  it("retorna 400 quando falta o anexo no download da evidencia legal", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await downloadLegalAttachment(new Request("http://localhost/api/students/student-1/legal-acceptances/a-1/attachments//download"), {
      params: Promise.resolve({ studentId: "student-1", acceptanceId: "acceptance-1", attachmentId: " " })
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o anexo da evidencia." });
    expect(proxyBinaryToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha o download da evidencia legal com parametros validados", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyBinaryToBackendMock.mockResolvedValue(new Response("ok", { status: 200 }));

    await downloadLegalAttachment(new Request("http://localhost/api/students/student-1/legal-acceptances/acceptance-1/attachments/attachment-1/download"), {
      params: Promise.resolve({
        studentId: "student-1",
        acceptanceId: "acceptance-1",
        attachmentId: "attachment-1"
      })
    });

    expect(proxyBinaryToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/legal-acceptances/acceptance-1/attachments/attachment-1/download",
      errorMessage: "Nao foi possivel baixar a evidencia do termo."
    });
  });

  it("retorna 400 quando falta o aceite legal no download do PDF consolidado", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });

    const response = await downloadLegalAcceptanceDocument(
      new Request("http://localhost/api/students/student-1/legal-acceptances//document/download"),
      {
        params: Promise.resolve({ studentId: "student-1", acceptanceId: " " })
      }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Informe o aceite legal do PDF." });
    expect(proxyBinaryToBackendMock).not.toHaveBeenCalled();
  });

  it("encaminha o download do PDF consolidado com parametros validados", async () => {
    requireInternalApiSessionMock.mockResolvedValue({ accessToken: "internal-token" });
    proxyBinaryToBackendMock.mockResolvedValue(new Response("pdf", { status: 200 }));

    await downloadLegalAcceptanceDocument(
      new Request("http://localhost/api/students/student-1/legal-acceptances/acceptance-1/document/download"),
      {
        params: Promise.resolve({ studentId: "student-1", acceptanceId: "acceptance-1" })
      }
    );

    expect(proxyBinaryToBackendMock).toHaveBeenCalledWith({
      session: { accessToken: "internal-token" },
      path: "/api/v1/students/student-1/legal-acceptances/acceptance-1/document",
      errorMessage: "Nao foi possivel baixar o PDF consolidado do termo."
    });
  });
});
