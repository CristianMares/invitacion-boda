'use client';
import { useState, useEffect } from 'react';
import { MonitorX } from 'lucide-react';

export default function PCOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (isMobile === null) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[999] bg-black text-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shadow-2xl">
          <MonitorX size={40} />
        </div>
        <h2 className="text-3xl font-serif text-amber-400">Sección Exclusiva para PC</h2>
        <p className="text-neutral-400 text-xs font-mono max-w-sm leading-relaxed">
          El editor gráfico y el asignador de mesas requieren una resolución mínima de pantalla (PC o Laptop) para garantizar la precisión del trazado.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}