import { neon } from '@neondatabase/serverless';
import { ImageIcon } from 'lucide-react';
import GalleryGrid from '@/components/GalleryGrid';

export const dynamic = 'force-dynamic';

export default async function GaleriaPublica() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  const fotos = await sql`
    SELECT id, cloudinary_url, created_at, likes, guest_message 
    FROM event_media 
    WHERE is_approved = true
    ORDER BY created_at DESC 
    LIMIT 100
  `;

  return (
    <div className="min-h-screen bg-black pb-20 selection:bg-amber-500 selection:text-black">
      <section className="bg-neutral-950 text-white pt-32 pb-20 px-4 text-center relative overflow-hidden border-b border-white/5">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold mb-4 font-mono">Live Feed</h3>
          <h1 className="text-5xl md:text-6xl font-serif mb-6 text-white drop-shadow-lg">Muro de Recuerdos</h1>
          <p className="text-neutral-400 font-light text-base">Las memorias aprobadas y dedicatorias compartidas por nuestros invitados.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        {fotos.length === 0 ? (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-[2rem] p-16 text-center border border-white/5 flex flex-col items-center gap-4">
            <ImageIcon size={40} className="text-neutral-600" />
            <p className="text-white font-serif text-xl">Aún no hay fotos publicadas en el muro</p>
          </div>
        ) : (
          <GalleryGrid initialMedia={fotos as any[]} />
        )}
      </div>
    </div>
  );
}