import { InteractiveMap } from "@/components/InteractiveMap";
import { Umbrella, Sun, Map } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="w-full px-4 md:px-8 py-4 md:py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Umbrella className="w-7 h-7 md:w-8 md:h-8 text-sky-500" />
          <span className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">BeachLounger</span>
        </div>
        <div className="flex gap-2 md:gap-4">
          <Link href="/login" className="px-3 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/login" className="px-3 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 font-medium text-sm mb-8">
            <Sun className="w-4 h-4" />
            <span>El verano ya está aquí. Reserva tu sitio.</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
            Tu rincón perfecto <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              frente al mar
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
            Selecciona tu sector favorito en la playa de Puerto Rico, elige tu hamaca y disfruta de un día de relax sin preocupaciones.
          </p>
        </div>

        {/* Interactive Map – full width on mobile, constrained on desktop */}
        <div className="mt-16 px-0 md:px-4 md:max-w-4xl md:mx-auto">
          <div className="flex items-center gap-2 justify-center mb-6 text-slate-500 font-medium px-4">
            <Map className="w-5 h-5" />
            <span>Toca un sector en el mapa para ver disponibilidad</span>
          </div>
          <InteractiveMap />
        </div>
      </section>
    </main>
  );
}
