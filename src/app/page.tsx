import { neon } from '@neondatabase/serverless';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Countdown from '@/components/Countdown';
import RSVP from '@/components/RSVP';
import Timeline from '@/components/Timeline';
import DressCode from '@/components/DressCode';
import GiftRegistry from '@/components/GiftRegistry';
import FadeIn from '@/components/FadeIn';
import CalendarButton from '@/components/CalendarButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  const configRows = await sql`SELECT key, value FROM event_config`;

  const configMap: Record<string, any> = {};
  configRows.forEach(r => configMap[r.key] = r.value);

  const heroInfo = configMap.hero_info;

  const weddingDate = configMap.wedding_date || '2026-12-31T20:00:00';
  const venueInfo = configMap.venue_info || { 
    name: 'Hacienda Las Rosas', 
    location: 'León, Guanajuato', 
    maps_url: 'https://maps.google.com' 
  };
  const dressCode = configMap.dress_code || { 
    title: 'Etiqueta Rigurosa', 
    note: 'Estrictamente prohibido color blanco o derivados.', 
    colors: ['#0a0a0a', '#1e293b', '#064e3b', '#4c0519'] 
  };
  const giftRegistry = configMap.gift_registry || { 
    bank: { bank_name: 'BBVA', holder: 'Cristian Mares', clabe: '012180012345678901' }, 
    links: [] 
  };
  const itinerary = configMap.itinerary || [];

  // Formatear fecha en texto legible
  const dateObj = new Date(weddingDate);
  const formattedDateText = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const capitalizedDateText = formattedDateText
    ? formattedDateText.charAt(0).toUpperCase() + formattedDateText.slice(1)
    : '';

  return (
    <main className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-amber-500 selection:text-black pb-20">
      
      {/* HERO SECTION DINÁMICO */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070" 
          alt="Boda Fondo" 
          fill 
          priority
          className="object-cover object-center opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black"></div>
        <FadeIn direction="down">
          <div className="relative z-10 text-center px-4 space-y-6">
            <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold font-mono">{heroInfo.subtitle}</h3>
            <h1 className="text-7xl md:text-9xl font-serif text-white drop-shadow-2xl">{heroInfo.initials}</h1>
            <p className="text-xl italic text-neutral-400 mt-4 font-light max-w-lg mx-auto">{heroInfo.description}</p>
          </div>
        </FadeIn>
      </section>

      {/* CUENTA REGRESIVA Y FECHA TEXTUAL */}
      <section className="py-24 px-4 bg-black overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <FadeIn>
            <h2 className="text-3xl font-serif text-white tracking-widest uppercase text-sm font-mono mb-2">El Gran Día</h2>
            
            {capitalizedDateText && (
              <p className="text-amber-400 font-serif text-xl md:text-2xl italic mb-6">
                {capitalizedDateText}
              </p>
            )}

            <Countdown targetDate={weddingDate} />
            <CalendarButton weddingDate={weddingDate} title={`Boda de ${heroInfo.initials}`} location={`${venueInfo.name}, ${venueInfo.location}`} />
          </FadeIn>
        </div>
      </section>

      {/* ITINERARIO */}
      <section className="py-24 px-4 bg-neutral-950 overflow-hidden border-t border-white/5">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-serif text-white">Itinerario</h2>
            <div className="w-24 h-1 bg-amber-500/50 mx-auto mt-6 rounded-full"></div>
          </div>
          <Timeline events={itinerary} />
        </FadeIn>
      </section>

      {/* DRESS CODE */}
      <section className="py-24 px-4 bg-black overflow-hidden border-t border-white/5">
        <FadeIn direction="up">
          <DressCode config={dressCode} />
        </FadeIn>
      </section>

      {/* RECEPCIÓN Y MESA DE REGALOS */}
      <section className="py-24 px-4 bg-neutral-950 overflow-hidden border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
          <FadeIn direction="right" delay={0.2}>
            <div className="bg-neutral-900/50 backdrop-blur-sm p-10 rounded-3xl border border-white/10 text-center space-y-6 h-full flex flex-col items-center justify-center hover:border-amber-500/30 transition-colors">
              <div className="w-20 h-20 bg-neutral-950 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <MapPin size={32} />
              </div>
              <h3 className="text-3xl font-serif text-white">Recepción</h3>
              <p className="text-neutral-400 font-sans leading-relaxed">
                {venueInfo.name}<br/>{venueInfo.location}
              </p>
              {venueInfo.maps_url && (
                <a 
                  href={venueInfo.maps_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 text-xs uppercase tracking-wider"
                >
                  Ver en Maps &rarr;
                </a>
              )}
            </div>
          </FadeIn>
          
          <FadeIn direction="left" delay={0.4}>
            <GiftRegistry config={giftRegistry} />
          </FadeIn>
        </div>
      </section>

      {/* RSVP */}
      <section className="py-32 px-4 bg-black text-white text-center overflow-hidden relative border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black pointer-events-none"></div>
        <FadeIn>
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif mb-6 text-white">Solicitud de Pases</h2>
            <p className="text-neutral-400 mb-10 max-w-md mx-auto text-lg font-light">
              Asegura tu lugar en nuestra celebración. Recibirás tu confirmación oficial y QRs de acceso vía WhatsApp.
            </p>
            <RSVP />
          </div>
        </FadeIn>
      </section>
    </main>
  );
}