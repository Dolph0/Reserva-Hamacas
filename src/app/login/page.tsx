"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Umbrella, User, Shield, Briefcase, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, redirectTo: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: "password123",
    });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mb-4">
            <Umbrella className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">BeachLounger</h1>
          <p className="text-slate-500 text-center mt-2 text-sm">Entorno de Pruebas. Selecciona un perfil para continuar.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-4" />
            <p className="text-slate-500">Iniciando sesión segura...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleLogin('client@reserva.local', '/')}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-sky-500 hover:bg-sky-50 transition-all group text-left"
            >
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Cliente</h3>
                <p className="text-sm text-slate-500">client@reserva.local</p>
              </div>
            </button>

            <button
              onClick={() => handleLogin('worker@reserva.local', '/worker')}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group text-left"
            >
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Trabajador</h3>
                <p className="text-sm text-slate-500">worker@reserva.local</p>
              </div>
            </button>

            <button
              onClick={() => handleLogin('admin@reserva.local', '/admin')}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
            >
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Administrador</h3>
                <p className="text-sm text-slate-500">admin@reserva.local</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
