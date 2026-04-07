"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SignaturePadProps = {
  name: string;
  resetKey?: number;
};

type Point = {
  x: number;
  y: number;
};

const CANVAS_BACKGROUND = "#fffdf8";
const STROKE_COLOR = "#204b57";

export function SignaturePad({ name, resetKey = 0 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<Point | null>(null);
  const drawingRef = useRef(false);
  const [dataUrl, setDataUrl] = useState("");
  const [hasSignature, setHasSignature] = useState(false);

  const clearSignature = useCallback(() => {
    const context = getContext();
    const canvas = canvasRef.current;
    if (!context || !canvas) {
      return;
    }

    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    context.fillStyle = CANVAS_BACKGROUND;
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    drawingRef.current = false;
    lastPointRef.current = null;
    setDataUrl("");
    setHasSignature(false);
  }, []);

  function configureContext() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.clientWidth || 640;
    const height = canvas.clientHeight || 220;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(ratio, ratio);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.strokeStyle = STROKE_COLOR;
    context.fillStyle = CANVAS_BACKGROUND;
    context.fillRect(0, 0, width, height);
    return context;
  }

  useEffect(() => {
    configureContext();

    const handleResize = () => {
      const previousDataUrl = dataUrl;
      const context = configureContext();
      const canvas = canvasRef.current;
      if (!context || !canvas || !previousDataUrl) {
        return;
      }

      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.clientWidth, canvas.clientHeight);
        setDataUrl(canvas.toDataURL("image/png"));
      };
      image.src = previousDataUrl;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dataUrl]);

  useEffect(() => {
    clearSignature();
  }, [clearSignature, resetKey]);

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

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = point;
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.arc(point.x, point.y, 0.8, 0, Math.PI * 2);
    context.fillStyle = STROKE_COLOR;
    context.fill();
    setHasSignature(true);
    persistSignature();
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

    event.preventDefault();
    const previousPoint = lastPointRef.current;
    if (!previousPoint) {
      lastPointRef.current = point;
      return;
    }

    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
    setHasSignature(true);
  }

  function stopDrawing(event?: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }

    if (event) {
      event.preventDefault();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    drawingRef.current = false;
    lastPointRef.current = null;
    persistSignature();
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
          onPointerCancel={stopDrawing}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-brand-subtext">
          {hasSignature
            ? "Assinatura capturada. Revise o traço antes de salvar."
            : "Assine no campo acima usando dedo, caneta ou mouse."}
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
