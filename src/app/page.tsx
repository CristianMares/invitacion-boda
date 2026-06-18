import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Countdown from '@/components/Countdown';
import RSVP from '@/components/RSVP';
import Timeline from '@/components/Timeline';
import DressCode from '@/components/DressCode';
import GiftRegistry from '@/components/GiftRegistry';
import FadeIn from '@/components/FadeIn';
import CalendarButton from '@/components/CalendarButton';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-amber-500 selection:text-black pb-20">
      
      {/* HERO SECTION */}
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
            <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold">Nuestra Boda</h3>
            <h1 className="text-7xl md:text-9xl font-serif text-white drop-shadow-2xl">M & X</h1>
            <p className="text-xl italic text-neutral-400 mt-4 font-light">Nos casamos, y queremos que seas parte de nuestra historia.</p>
          </div>
        </FadeIn>
      </section>

      {/* CUENTA REGRESIVA */}
      <section className="py-24 px-4 bg-black overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="text-3xl font-serif mb-8 text-white tracking-widest uppercase text-sm">El Gran Día</h2>
            <Countdown targetDate="2026-12-31T20:00:00" />
            <CalendarButton />
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
          <Timeline />
        </FadeIn>
      </section>

      {/* DRESS CODE */}
      <section className="py-24 px-4 bg-black overflow-hidden border-t border-white/5">
        <FadeIn direction="up">
          <DressCode />
        </FadeIn>
      </section>

      {/* RECEPCIÓN Y REGALOS */}
      <section className="py-24 px-4 bg-neutral-950 overflow-hidden border-t border-white/5 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 relative z-10">
          <FadeIn direction="right" delay={0.2}>
            <div className="bg-neutral-900/50 backdrop-blur-sm p-10 rounded-3xl border border-white/10 text-center space-y-6 h-full flex flex-col items-center justify-center hover:border-amber-500/30 transition-colors">
              <div className="w-20 h-20 bg-neutral-950 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                <MapPin size={32} />
              </div>
              <h3 className="text-3xl font-serif text-white">Recepción</h3>
              <p className="text-neutral-400">Hacienda Las Rosas<br/>León, Guanajuato</p>
              <a 
                href="https://maps.google.com/?q=Hacienda+Las+Rosas+Leon+Guanajuato" 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
              >
                Ver en Maps &rarr;
              </a>
            </div>
          </FadeIn>
          
          <FadeIn direction="left" delay={0.4}>
            <GiftRegistry />
          </FadeIn>
        </div>
      </section>

      {/* RSVP (SOLICITUD) */}
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