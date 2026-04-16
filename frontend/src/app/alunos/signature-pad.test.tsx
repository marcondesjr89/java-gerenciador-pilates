import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignaturePad } from "@/app/alunos/signature-pad";

describe("SignaturePad", () => {
  const clearRectMock = vi.fn();
  const setTransformMock = vi.fn();
  const scaleMock = vi.fn();
  const fillRectMock = vi.fn();
  const beginPathMock = vi.fn();
  const moveToMock = vi.fn();
  const arcMock = vi.fn();
  const fillMock = vi.fn();
  const lineToMock = vi.fn();
  const strokeMock = vi.fn();
  const saveMock = vi.fn();
  const restoreMock = vi.fn();
  const drawImageMock = vi.fn();

  beforeEach(() => {
    clearRectMock.mockReset();
    setTransformMock.mockReset();
    scaleMock.mockReset();
    fillRectMock.mockReset();
    beginPathMock.mockReset();
    moveToMock.mockReset();
    arcMock.mockReset();
    fillMock.mockReset();
    lineToMock.mockReset();
    strokeMock.mockReset();
    saveMock.mockReset();
    restoreMock.mockReset();
    drawImageMock.mockReset();

    Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 320
    });
    Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 160
    });
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      x: 0,
      y: 0,
      width: 320,
      height: 160,
      top: 0,
      left: 0,
      right: 320,
      bottom: 160,
      toJSON: () => ({})
    }));
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      setTransform: setTransformMock,
      clearRect: clearRectMock,
      scale: scaleMock,
      fillRect: fillRectMock,
      beginPath: beginPathMock,
      moveTo: moveToMock,
      arc: arcMock,
      fill: fillMock,
      lineTo: lineToMock,
      stroke: strokeMock,
      save: saveMock,
      restore: restoreMock,
      drawImage: drawImageMock,
      lineCap: "round",
      lineJoin: "round",
      lineWidth: 2.5,
      strokeStyle: "#204b57",
      fillStyle: "#fffdf8"
    })) as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,signature");
  });

  it("mantem o traco no pointerup sem reconfigurar o canvas", () => {
    const { container } = render(<SignaturePad name="tabletSignatureDataUrl" />);
    const canvas = container.querySelector("canvas");
    const hiddenInput = container.querySelector('input[name="tabletSignatureDataUrl"]');

    if (!canvas || !hiddenInput) {
      throw new Error("SignaturePad nao renderizou o canvas esperado.");
    }

    Object.assign(canvas, {
      setPointerCapture: vi.fn(),
      releasePointerCapture: vi.fn(),
      hasPointerCapture: vi.fn(() => true)
    });

    expect(clearRectMock).toHaveBeenCalledTimes(2);

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 24, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 40, clientY: 24, pointerId: 1 });

    expect(strokeMock).toHaveBeenCalled();
    expect(hiddenInput).toHaveValue("data:image/png;base64,signature");
    expect(clearRectMock).toHaveBeenCalledTimes(2);
  });
});
