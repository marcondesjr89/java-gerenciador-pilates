"use client";

import { useEffect, useRef, useState } from "react";

type SignaturePadProps = {
  name: string;
};

export function SignaturePad({ name }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.clientWidth || 640;
    const height = canvas.clientHeight || 220;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.scale(ratio, ratio);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2;
    context.strokeStyle = "#204b57";
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, width, height);
  }, []);

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    return canvas.getContext("2d");
  }

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function persistSignature() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setDataUrl(canvas.toDataURL("image/png"));
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = getContext();
    const point = getPoint(event);
    if (!context || !point) {
      return;
    }

    drawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }

    const context = getContext();
    const point = getPoint(event);
    if (!context || !point) {
      return;
    }

    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    persistSignature();
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = getContext();
    if (!canvas || !context) {
      return;
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    context.fillStyle = "#fffdf8";
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    setDataUrl("");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[22px] border border-dashed border-brand-line bg-[#fffdf8] p-3">
        <canvas
          ref={canvasRef}
          className="h-40 w-full touch-none rounded-2xl"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-brand-subtext">
          {dataUrl ? "Assinatura capturada." : "Assine no campo acima usando dedo, caneta ou mouse."}
        </p>
        <button
          type="button"
          onClick={clearSignature}
          className="rounded-2xl border border-brand-line px-3 py-2 text-sm font-semibold text-brand-secondary transition hover:bg-brand-soft"
        >
          Limpar assinatura
        </button>
      </div>

      <input type="hidden" name={name} value={dataUrl} />
    </div>
  );
}
