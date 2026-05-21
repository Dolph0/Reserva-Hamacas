import { SectorMap } from "@/components/SectorMap";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Umbrella } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!['naranja', 'azul', 'espigon'].includes(id)) {
    notFound();
  }

  const { data: hamacas, error } = await supabase
    .from('hamacas')
    .select('*')
    .eq('sector', id)
    .order('number', { ascending: true });

  if (error) {
    console.error(error);
    return <div>Error loading hamacas</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Umbrella className="w-6 h-6 text-sky-500" />
              <h1 className="text-xl font-bold text-slate-800 capitalize">Sector {id}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <SectorMap sectorId={id} initialHamacas={hamacas || []} />
      </div>
    </main>
  );
}
