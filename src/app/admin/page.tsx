import { supabase } from "@/lib/supabase";
import { BarChart3, TrendingUp, Users, DollarSign, Umbrella } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { data: hamacas } = await supabase.from('hamacas').select('*');
  const { data: reservations } = await supabase.from('reservations').select('*').eq('reservation_date', new Date().toISOString().split('T')[0]);

  const totalHamacas = hamacas?.length || 0;
  const occupiedHamacas = reservations?.length || 0;
  const occupancyRate = totalHamacas > 0 ? (occupiedHamacas / totalHamacas) * 100 : 0;

  const onlineReservations = reservations?.filter(r => r.origin === 'online') || [];
  const presentialReservations = reservations?.filter(r => r.origin === 'presential') || [];

  const onlineIncome = onlineReservations.reduce((acc, r) => acc + Number(r.total), 0);
  const presentialIncome = presentialReservations.reduce((acc, r) => acc + Number(r.total), 0);
  const totalIncome = onlineIncome + presentialIncome;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
            <p className="text-slate-500">Métricas en tiempo real de la playa</p>
          </div>
          <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 flex items-center gap-2 text-sm font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            En vivo
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Ingresos Totales" 
            value={`${totalIncome.toFixed(2)}€`}
            icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
            trend="+12%"
          />
          <StatCard 
            title="Ingresos Online" 
            value={`${onlineIncome.toFixed(2)}€`}
            icon={<TrendingUp className="w-6 h-6 text-sky-500" />}
          />
          <StatCard 
            title="Ingresos Presenciales" 
            value={`${presentialIncome.toFixed(2)}€`}
            icon={<Users className="w-6 h-6 text-orange-500" />}
          />
          <StatCard 
            title="Ocupación Actual" 
            value={`${occupancyRate.toFixed(1)}%`}
            icon={<Umbrella className="w-6 h-6 text-indigo-500" />}
            subtitle={`${occupiedHamacas} de ${totalHamacas} hamacas`}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Area */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800">Origen de Ingresos</h2>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            
            <div className="flex items-end gap-16 h-64 px-8 pb-4 border-b border-slate-100 relative">
              {/* Simple CSS Chart */}
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-sky-500 rounded-t-xl transition-all duration-500 group-hover:bg-sky-400 relative"
                  style={{ height: `${totalIncome > 0 ? (onlineIncome / totalIncome) * 100 : 0}%`, minHeight: '20px' }}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-slate-700">{onlineIncome}€</span>
                </div>
                <span className="text-sm font-medium text-slate-500">Online</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-orange-400 rounded-t-xl transition-all duration-500 group-hover:bg-orange-300 relative"
                  style={{ height: `${totalIncome > 0 ? (presentialIncome / totalIncome) * 100 : 0}%`, minHeight: '20px' }}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-slate-700">{presentialIncome}€</span>
                </div>
                <span className="text-sm font-medium text-slate-500">Presencial</span>
              </div>
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Últimas Reservas</h2>
            <div className="flex flex-col gap-4">
              {reservations?.slice(0, 5).map(res => (
                <div key={res.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-semibold text-slate-800">Hamaca {hamacas?.find(h => h.id === res.hamaca_id)?.number || '?'}</p>
                    <p className="text-xs text-slate-500 capitalize">{res.origin}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sky-600">+{res.total}€</p>
                    <p className="text-xs text-slate-500">{new Date(res.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {(!reservations || reservations.length === 0) && (
                <p className="text-center text-slate-500 py-8">No hay reservas hoy</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, subtitle }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-slate-50 rounded-2xl">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-slate-800">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
