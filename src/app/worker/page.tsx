"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, ShieldAlert, ScanLine } from "lucide-react";
import Link from "next/link";

interface Hamaca {
  id: string;
  number: number;
  sector: string;
  status: "available" | "occupied_online" | "occupied_presential";
  price_base: number;
}

export default function WorkerPanel() {
  const [hamacas, setHamacas] = useState<Hamaca[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHamacas = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('hamacas').select('*').order('sector').order('number');
    if (!error && data) setHamacas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHamacas();
  }, []);

  const toggleStatus = async (h: Hamaca) => {
    if (h.status === "occupied_online") {
      alert("No puedes modificar una hamaca reservada online desde aquí.");
      return;
    }
    
    const newStatus = h.status === "available" ? "occupied_presential" : "available";
    
    // Opt update
    setHamacas(prev => prev.map(item => item.id === h.id ? { ...item, status: newStatus } : item));

    const { error } = await supabase.from('hamacas').update({ status: newStatus }).eq('id', h.id);
    
    if (error) {
      alert("Error al actualizar la base de datos.");
      fetchHamacas();
    } else if (newStatus === "occupied_presential") {
      // Simular inserción de reserva presencial
      await supabase.from('reservations').insert({
        user_id: '00000000-0000-0000-0000-000000000002', // Worker
        hamaca_id: h.id,
        reservation_date: new Date().toISOString().split('T')[0],
        status: 'validated',
        origin: 'presential',
        total: h.price_base
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando panel de trabajador...</div>;

  const grouped = hamacas.reduce((acc, h) => {
    if (!acc[h.sector]) acc[h.sector] = [];
    acc[h.sector].push(h);
    return acc;
  }, {} as Record<string, Hamaca[]>);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Panel de Operario</h1>
              <p className="text-slate-500 text-sm">Gestión de ocupación presencial en tiempo real</p>
            </div>
          </div>
          <Link
            href="/worker/scan"
            className="flex items-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-medium shadow-md shadow-sky-500/20 transition-colors"
          >
            <ScanLine className="w-5 h-5" />
            <span className="hidden sm:inline">Escanear QR</span>
          </Link>
        </header>

        <div className="space-y-8">
          {Object.entries(grouped).map(([sector, items]) => (
            <div key={sector} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 capitalize mb-6 border-b border-slate-100 pb-4">
                Sector {sector}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map(h => (
                  <button
                    key={h.id}
                    onClick={() => toggleStatus(h)}
                    className={`relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                      h.status === 'available' 
                        ? 'border-slate-200 bg-slate-50 hover:border-sky-500 hover:bg-sky-50 text-slate-600'
                        : h.status === 'occupied_online'
                          ? 'border-sky-500 bg-sky-500 text-white opacity-80 cursor-not-allowed'
                          : 'border-orange-500 bg-orange-500 text-white'
                    }`}
                  >
                    <span className="text-2xl font-black mb-1">{h.number}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                      {h.status === 'available' ? 'Libre' : h.status === 'occupied_online' ? 'Online' : 'Presencial'}
                    </span>
                    {h.status !== 'available' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-md">
                        {h.status === 'occupied_online' ? <Check className="w-3 h-3 text-sky-500" /> : <X className="w-3 h-3 text-orange-500" />}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
