"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Loader2, X, Camera } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";

/* ─── Status machine ─── */
type PaymentStatus = "idle" | "processing" | "success" | "error";

interface FakePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hamaca: {
    id: string;
    number: number;
    price_base: number;
  };
  onSuccess: () => void;
  /** Sector ID used for display context in the QR success screen */
  sectorId?: string;
}

export function FakePaymentDialog({
  isOpen,
  onClose,
  hamaca,
  onSuccess,
  sectorId,
}: FakePaymentDialogProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [qrValue, setQrValue] = useState("");
  const paymentSucceededRef = useRef(false);

  if (!isOpen) return null;

  /* ─── Business logic ─── */
  const handlePay = async () => {
    setStatus("processing");

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000001",
          hamaca_id: hamaca.id,
          reservation_date: new Date().toISOString().split("T")[0],
          status: "validated",
          origin: "online",
          total: hamaca.price_base,
        })
        .select("qr_code")
        .single();

      if (error) throw error;

      await supabase
        .from("hamacas")
        .update({ status: "occupied_online" })
        .eq("id", hamaca.id);

      setQrValue(data.qr_code);
      setStatus("success");
      paymentSucceededRef.current = true;
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (paymentSucceededRef.current) {
      paymentSucceededRef.current = false;
      onSuccess();
    }
    setStatus("idle");
    setQrValue("");
    onClose();
  };

  /* ─── UI (pure rendering) ─── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative overflow-hidden"
      >
        {/* Close button — always visible */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {status === "success" ? "¡Reserva Confirmada!" : "Confirmar Reserva"}
        </h2>

        {/* ── Summary ── */}
        {status !== "success" && (
          <div className="bg-slate-50 p-4 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500">Hamaca</span>
              <span className="font-semibold text-slate-800">
                #{hamaca.number}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-slate-800">Total a pagar</span>
              <span className="text-sky-600">
                {hamaca.price_base.toFixed(2)}€
              </span>
            </div>
          </div>
        )}

        {/* ── Idle: Pay button ── */}
        {status === "idle" && (
          <button
            onClick={handlePay}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Pagar con Tarjeta (Simulado)
          </button>
        )}

        {/* ── Processing ── */}
        {status === "processing" && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-sky-500" />
            <p>Procesando pago seguro...</p>
          </div>
        )}

        {/* ── Success: QR Code ── */}
        {status === "success" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            {/* Success icon */}
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            {/* Reservation details */}
            <div className="bg-slate-50 rounded-2xl p-4 w-full mb-5">
              <div className="flex justify-between text-sm text-slate-500 mb-1">
                <span>Hamaca</span>
                <span className="font-semibold text-slate-800">
                  #{hamaca.number}
                </span>
              </div>
              {sectorId && (
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>Sector</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {sectorId}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>Total</span>
                <span className="font-semibold text-sky-600">
                  {hamaca.price_base.toFixed(2)}€
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
              <QRCodeSVG
                value={qrValue}
                size={200}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>

            {/* Screenshot hint */}
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 w-full">
              <Camera className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                <strong className="text-amber-700">
                  Haz una captura de pantalla
                </strong>{" "}
                y muéstrala al hamaquero al llegar.
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <div className="text-center py-6 text-red-500">
            <p>Error procesando el pago. Intenta nuevamente.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-sm underline"
            >
              Reintentar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
