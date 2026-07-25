import { neon } from '@neondatabase/serverless';
import { ShieldCheck, ImageIcon } from 'lucide-react';
import AdminPhotoCard from '@/components/AdminPhotoCard';

export const dynamic = 'force-dynamic';

export default async function AdminGaleria() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  const fotos = await sql`SELECT * FROM event_media ORDER BY is_approved ASC, created_at DESC`;

  return (
    <div className="h-full bg-neutral-950 text-white p-4 md:p-10 overflow-y-auto selection:bg-amber-500 selection:text-black">
      <div className="max-w-7xl mx-auto pb-24 space-y-8">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-6 pt-12 md:pt-0">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">Moderación de Galería</h1>
            <p className="text-neutral-500 text-xs mt-1 font-mono">Aprueba fotos de invitados antes de ser visibles en el muro público.</p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Control Panel</span>
          </div>
        </div>

        {fotos.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/20 rounded-3xl border border-dashed border-neutral-800">
            <ImageIcon size={48} className="text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 text-xs font-mono">No hay fotografías registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {fotos.map((foto) => (
              <AdminPhotoCard key={foto.id} foto={foto as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}