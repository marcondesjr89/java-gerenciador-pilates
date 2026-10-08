import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreatePlanModal } from "@/app/financeiro/create-plan-modal";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

describe("CreatePlanModal", () => {
  it("não renderiza conteúdo quando isOpen é false", () => {
    const { container } = render(<CreatePlanModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza como diálogo acessível com título quando isOpen é true", () => {
    render(<CreatePlanModal isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Novo Plano de Mensalidade" })).toBeInTheDocument();
  });

  it("chama onClose ao clicar no botão fechar", () => {
    const handleClose = vi.fn();
    render(<CreatePlanModal isOpen={true} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Fechar modal de cadastro de plano" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("chama onClose ao pressionar tecla Escape", () => {
    const handleClose = vi.fn();
    render(<CreatePlanModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
