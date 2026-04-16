import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchActiveStudents } from "@/lib/users";

describe("fetchActiveStudents", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("filtra alunos ativos e ordena por nome", async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: "2", fullName: "Zeca", status: "ACTIVE" },
          { id: "3", fullName: "Bruna", status: "INACTIVE" },
          { id: "1", fullName: "Ana", status: "ACTIVE" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const students = await fetchActiveStudents({ accessToken: "token" } as never);

    expect(students).toEqual([
      { id: "1", fullName: "Ana", status: "ACTIVE" },
      { id: "2", fullName: "Zeca", status: "ACTIVE" }
    ]);
  });
});
