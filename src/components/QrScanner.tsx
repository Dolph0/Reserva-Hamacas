"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, AlertCircle } from "lucide-react";

/**
 * Wrapper component for html5-qrcode.
 * Handles camera permissions, scanning lifecycle, and error states.
 * Optimised for mobile viewport.
 */

interface QrScannerProps {
  /** Called with the decoded text when a QR is successfully scanned */
  onScanSuccess: (decodedText: string) => void;
  /** If true the scanner pauses (e.g. while showing results) */
  paused?: boolean;
}

export function QrScanner({ onScanSuccess, paused = false }: QrScannerProps) {
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    let html5QrCode: any = null;
    let mounted = true;

    const initScanner = async () => {
      try {
        // Dynamic import to avoid SSR issues with html5-qrcode
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!mounted) return;

        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            onScanSuccess(decodedText);
          },
          () => {
            // Ignore scan failures (no QR found in frame) — this is normal
          }
        );

        if (mounted) setIsStarting(false);
      } catch (err: any) {
        if (!mounted) return;
        console.error("QR scanner init error:", err);
        setIsStarting(false);

        if (err?.toString().includes("NotAllowedError")) {
          setError("Permiso de cámara denegado. Actívalo en la configuración del navegador.");
        } else if (err?.toString().includes("NotFoundError")) {
          setError("No se encontró ninguna cámara en este dispositivo.");
        } else {
          setError("No se pudo iniciar la cámara. Asegúrate de que ninguna otra app la esté usando.");
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (html5QrCode) {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch(() => {
            /* scanner already stopped */
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause / resume scanning
  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (paused) {
        scanner.pause(/* shouldPauseVideo */ true);
      } else {
        scanner.resume();
      }
    } catch {
      /* scanner may not be in the right state — ignore */
    }
  }, [paused]);

  /* ─── Error state ─── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-2xl border border-red-200">
        <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-red-500 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto" ref={containerRef}>
      {/* Loading overlay */}
      {isStarting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 rounded-2xl min-h-[300px]">
          <Camera className="w-10 h-10 text-slate-400 animate-pulse mb-3" />
          <p className="text-slate-500 text-sm">Iniciando cámara...</p>
        </div>
      )}

      {/* html5-qrcode mounts its video here */}
      <div
        id="qr-reader"
        className="rounded-2xl overflow-hidden"
        style={{ minHeight: isStarting ? 300 : undefined }}
      />
    </div>
  );
}
