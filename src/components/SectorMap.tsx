"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FakePaymentDialog } from "./FakePaymentDialog";

interface Hamaca {
  id: string;
  number: number;
  x_relative: number;
  y_relative: number;
  price_base: number;
  status: "available" | "occupied_online" | "occupied_presential";
}

export function SectorMap({ sectorId, initialHamacas }: { sectorId: string, initialHamacas: Hamaca[] }) {
  const [selectedHamaca, setSelectedHamaca] = useState<Hamaca | null>(null);
  const [hamacas, setHamacas] = useState<Hamaca[]>(initialHamacas);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const sectorImageMap: Record<string, string> = {
    naranja: "/Sector naranja.png",
    azul: "/Sector azul.png",
    espigon: "/Zona espigon.png"
  };

  // Color tokens per sector — extensible for future sectors
  const sectorColors: Record<string, {
    border: string;
    text: string;
    hover: string;
    selected: string;
    selectedText: string;
    legend: string;
    button: string;
    buttonHover: string;
    shadow: string;
    infoBg: string;
    infoBorder: string;
    infoText: string;
    infoPrice: string;
  }> = {
    azul: {
      border: "border-sky-500",
      text: "text-sky-600",
      hover: "hover:bg-sky-100",
      selected: "bg-sky-500",
      selectedText: "text-white",
      legend: "border-sky-500",
      button: "bg-sky-500 hover:bg-sky-600",
      buttonHover: "",
      shadow: "shadow-sky-500/20",
      infoBg: "bg-sky-50",
      infoBorder: "border-sky-100",
      infoText: "text-sky-900",
      infoPrice: "text-sky-600",
    },
    naranja: {
      border: "border-orange-500",
      text: "text-orange-500",
      hover: "hover:bg-orange-50",
      selected: "bg-orange-500",
      selectedText: "text-white",
      legend: "border-orange-500",
      button: "bg-orange-500 hover:bg-orange-600",
      buttonHover: "",
      shadow: "shadow-orange-500/20",
      infoBg: "bg-orange-50",
      infoBorder: "border-orange-100",
      infoText: "text-orange-900",
      infoPrice: "text-orange-500",
    },
    espigon: {
      border: "border-emerald-500",
      text: "text-emerald-600",
      hover: "hover:bg-emerald-50",
      selected: "bg-emerald-500",
      selectedText: "text-white",
      legend: "border-emerald-500",
      button: "bg-emerald-500 hover:bg-emerald-600",
      buttonHover: "",
      shadow: "shadow-emerald-500/20",
      infoBg: "bg-emerald-50",
      infoBorder: "border-emerald-100",
      infoText: "text-emerald-900",
      infoPrice: "text-emerald-600",
    },
  };

  const colors = sectorColors[sectorId] ?? sectorColors.azul;
  const imageSrc = sectorImageMap[sectorId] || "/Sector naranja.png";

  const handleSelect = (hamaca: Hamaca) => {
    if (hamaca.status !== "available") return;
    setSelectedHamaca(hamaca);
  };

  const handlePaymentSuccess = () => {
    // Optimistic update
    setHamacas(prev => prev.map(h => h.id === selectedHamaca?.id ? { ...h, status: "occupied_online" } : h));
    setSelectedHamaca(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Map Area */}
      <div className="flex-1 relative bg-slate-200 rounded-3xl overflow-hidden shadow-xl border-4 border-white h-fit">
        <Image src={imageSrc} alt={`Sector ${sectorId}`} width={800} height={1000} className="w-full h-auto block" priority />

        {hamacas.map(h => (
          <motion.button
            key={h.id}
            whileHover={h.status === "available" ? { scale: 1.2 } : {}}
            whileTap={h.status === "available" ? { scale: 0.9 } : {}}
            onClick={() => handleSelect(h)}
            className={`absolute w-[18px] h-[18px] -ml-[9px] -mt-[9px] md:w-[22px] md:h-[22px] md:-ml-[11px] md:-mt-[11px] lg:w-8 lg:h-8 lg:-ml-4 lg:-mt-4 rounded-full border-2 shadow-md flex items-center justify-center text-[7px] md:text-[9px] lg:text-xs font-bold transition-colors ${h.status === "available"
                ? selectedHamaca?.id === h.id
                  ? `${colors.selected} border-white ${colors.selectedText} z-20`
                  : `bg-white/90 ${colors.border} ${colors.text} ${colors.hover} z-10`
                : "bg-red-500/80 border-white text-white cursor-not-allowed z-0"
              }`}
            style={{ left: `${h.x_relative}%`, top: `${h.y_relative}%` }}
          >
            {h.number}
          </motion.button>
        ))}
      </div>

      {/* Sidebar Area */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 capitalize">Sector {sectorId}</h2>

          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className={`w-4 h-4 rounded-full bg-white border-2 ${colors.legend} shadow-sm`} />
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-red-500/80 border-2 border-white shadow-sm" />
              <span>Ocupada</span>
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {selectedHamaca ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 ${colors.infoBg} rounded-2xl border ${colors.infoBorder}`}
              >
                <h3 className={`font-semibold ${colors.infoText} mb-1`}>Hamaca #{selectedHamaca.number}</h3>
                <p className={`text-2xl font-bold ${colors.infoPrice} mb-4`}>{selectedHamaca.price_base.toFixed(2)}€</p>
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className={`w-full py-3 ${colors.button} text-white rounded-xl font-medium shadow-md ${colors.shadow} transition-all active:scale-95`}
                >
                  Reservar Ahora
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
              >
                Selecciona una hamaca disponible en el mapa para continuar.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedHamaca && (
        <FakePaymentDialog
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          hamaca={selectedHamaca}
          onSuccess={handlePaymentSuccess}
          sectorId={sectorId}
        />
      )}
    </div>
  );
}
