import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/ui/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("inicializa no tema light por padrão quando localStorage está vazio", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("gp-theme")).toBe("light");
  });

  it("restaura o tema dark quando salvo previamente no localStorage", () => {
    window.localStorage.setItem("gp-theme", "dark");

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(button).toHaveTextContent("Light");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("gp-theme")).toBe("dark");
  });

  it("faz fallback seguro para light quando localStorage contém valor inesperado", () => {
    window.localStorage.setItem("gp-theme", "sepia-invalido");

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(button).toHaveTextContent("Dark");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("gp-theme")).toBe("light");
  });

  it("alterna entre light e dark atualizando data-theme e localStorage a cada clique", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Alternar tema" });
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(button).toHaveTextContent("Dark");

    fireEvent.click(button);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("gp-theme")).toBe("dark");
    expect(button).toHaveTextContent("Light");

    fireEvent.click(button);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("gp-theme")).toBe("light");
    expect(button).toHaveTextContent("Dark");
  });
});
