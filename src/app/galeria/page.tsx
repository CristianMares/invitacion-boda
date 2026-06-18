import { neon } from '@neondatabase/serverless';
import { ImageIcon } from 'lucide-react';
import GalleryGrid from '@/components/GalleryGrid';

// Evita caché estático, asegura fotos en tiempo real
export const dynamic = 'force-dynamic';

export default async function GaleriaPublica() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  // Límite inicial preventivo de 100 fotos recientes
  const fotos = await sql`
    SELECT id, cloudinary_url, created_at, likes 
    FROM event_media 
    ORDER BY created_at DESC 
    LIMIT 100
  `;

  return (
    <div className="min-h-screen bg-black pb-20 selection:bg-amber-500 selection:text-black">
      {/* Header Galería Premium */}
      <section className="bg-neutral-950 text-white pt-32 pb-24 px-4 text-center relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold mb-4">Live Feed</h3>
          <h1 className="text-5xl md:text-6xl font-serif mb-6 text-white drop-shadow-lg">Muro de Recuerdos</h1>
          <p className="text-neutral-400 font-light text-lg">Las memorias capturadas por nuestros invitados durante la celebración, reveladas en tiempo real.</p>
        </div>
      </section>

      {/* Contenedor del Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-20">
        {fotos.length === 0 ? (
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-[2rem] p-20 text-center border border-white/5 flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-inner">
              <ImageIcon size={40} className="text-neutral-600" />
            </div>
            <div>
              <p className="text-white font-serif text-2xl mb-2">Aún no hay fotos</p>
              <p className="text-neutral-500">Sé el primero en usar la cámara analógica.</p>
            </div>
          </div>
        ) : (
          <GalleryGrid initialMedia={fotos as any[]} />
        )}
      </div>
    </div>
  );
}