'use client';
import { useState, useEffect } from 'react';
import { MonitorX } from 'lucide-react';

export default function PCOnlyGuard({ children }: { children: React.ReactNode }) {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      console.log(`[PCOnlyGuard] Ancho actual detectado: ${width}px | Modo bloqueado: ${width < 1024}`);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (windowWidth === null) return null;

  if (windowWidth < 1024) {
    return (
      <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-2xl text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-pulse">
          <MonitorX size={40} />
        </div>
        <h2 className="text-3xl font-serif text-amber-400">Pantalla Incompatible</h2>
        <p className="text-neutral-300 text-xs font-mono max-w-sm leading-relaxed bg-neutral-900/80 p-4 rounded-xl border border-white/10">
          Esta herramienta requiere una resolución de pantalla más grande (PC o Laptop) para garantizar la precisión al trazar objetos o mover mesas.
        </p>
        <span className="text-[10px] text-neutral-500 font-mono">Resolución detectada: {windowWidth}px</span>
      </div>
    );
  }

  return <>{children}</>;
}