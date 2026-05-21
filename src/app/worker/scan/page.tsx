"use client";

import { useState, useCallback } from "react";
import { QrScanner } from "@/components/QrScanner";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ScanLine,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
interface ReservationResult {
  id: string;
  reservation_date: string;
  status: string;
  total: number;
  hamaca: {
    number: number;
    sector: string;
  };
}

type ScanState =
  | { kind: "scanning" }
  | { kind: "loading" }
  | { kind: "valid"; reservation: ReservationResult }
  | { kind: "not-found" }
  | { kind: "invalid-status"; reservation: ReservationResult }
  | { kind: "error"; message: string };

export default function WorkerScanPage() {
  const [scanState, setScanState] = useState<ScanState>({ kind: "scanning" });

  const handleScan = useCallback(async (decodedText: string) => {
    // Avoid double-scanning while already processing
    setScanState((prev) => {
      if (prev.kind !== "scanning") return prev;
      return { kind: "loading" };
    });

    // Check current state — if not scanning, bail out
    // (the state update above is async, so we use a flag)
    try {
      const qrCode = decodedText.trim();

      // UUID v4 format validation (the qr_code column is UUID)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(qrCode)) {
        setScanState({ kind: "not-found" });
        return;
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("id, reservation_date, status, total, hamaca:hamacas(number, sector)")
        .eq("qr_code", qrCode)
        .single();

      if (error || !data) {
        setScanState({ kind: "not-found" });
        return;
      }

      // Flatten the joined hamaca object
      const reservation: ReservationResult = {
        id: data.id,
        reservation_date: data.reservation_date,
        status: data.status,
        total: data.total,
        hamaca: Array.isArray(data.hamaca) ? data.hamaca[0] : data.hamaca,
      };

      if (reservation.status === "validated") {
        setScanState({ kind: "valid", reservation });
      } else {
        setScanState({ kind: "invalid-status", reservation });
      }
    } catch (err: any) {
      console.error("Scan lookup error:", err);
      setScanState({ kind: "error", message: "Error al consultar la reserva." });
    }
  }, []);

  const resetScan = () => setScanState({ kind: "scanning" });

  const isPaused = scanState.kind !== "scanning";

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/worker"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">
              Escanear Reserva
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Scanner viewport */}
        <QrScanner onScanSuccess={handleScan} paused={isPaused} />

        {/* Result overlay */}
        <AnimatePresence mode="wait">
          {/* Loading */}
          {scanState.kind === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center"
            >
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Verificando reserva...</p>
            </motion.div>
          )}

          {/* Valid reservation */}
          {scanState.kind === "valid" && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-green-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">
                    Reserva Válida
                  </h3>
                  <p className="text-sm text-green-600">
                    El cliente tiene reserva confirmada
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Hamaca</span>
                  <span className="font-bold text-green-900">
                    #{scanState.reservation.hamaca.number}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Sector</span>
                  <span className="font-bold text-green-900 capitalize">
                    {scanState.reservation.hamaca.sector}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Fecha</span>
                  <span className="font-bold text-green-900">
                    {new Date(
                      scanState.reservation.reservation_date
                    ).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Total pagado</span>
                  <span className="font-bold text-green-900">
                    {Number(scanState.reservation.total).toFixed(2)}€
                  </span>
                </div>
              </div>

              <button
                onClick={resetScan}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
              >
                Escanear otra reserva
              </button>
            </motion.div>
          )}

          {/* Not found */}
          {scanState.kind === "not-found" && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">
                    Reserva No Encontrada
                  </h3>
                  <p className="text-sm text-red-600">
                    Este QR no corresponde a ninguna reserva
                  </p>
                </div>
              </div>
              <button
                onClick={resetScan}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Escanear de nuevo
              </button>
            </motion.div>
          )}

          {/* Invalid status (cancelled, etc.) */}
          {scanState.kind === "invalid-status" && (
            <motion.div
              key="invalid-status"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-amber-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-800">
                    Reserva{" "}
                    {scanState.reservation.status === "cancelled"
                      ? "Cancelada"
                      : scanState.reservation.status === "pending"
                      ? "Pendiente"
                      : scanState.reservation.status}
                  </h3>
                  <p className="text-sm text-amber-600">
                    Hamaca #{scanState.reservation.hamaca.number} — Sector{" "}
                    {scanState.reservation.hamaca.sector}
                  </p>
                </div>
              </div>
              <button
                onClick={resetScan}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
              >
                Escanear otra reserva
              </button>
            </motion.div>
          )}

          {/* Error */}
          {scanState.kind === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-300 text-center"
            >
              <p className="text-red-600 mb-4">{scanState.message}</p>
              <button
                onClick={resetScan}
                className="text-sm text-red-500 underline"
              >
                Reintentar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint text */}
        {scanState.kind === "scanning" && (
          <p className="text-center text-sm text-slate-400">
            Apunta la cámara al código QR de la reserva del cliente
          </p>
        )}
      </div>
    </div>
  );
}
