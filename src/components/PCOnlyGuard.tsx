'use client';
import { useState, useEffect } from 'react';
import { MonitorX } from 'lucide-react';

export default function PCOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return (
    <>
      {/* CAPA DE BLOQUEO EN MÓVILES (CSS Y JS) */}
      <div className={`${isMobile ? 'flex' : 'hidden'} lg:hidden fixed inset-0 z-[99999] bg-black text-white flex-col items-center justify-center p-6 text-center space-y-4`}>
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shadow-2xl">
          <MonitorX size={40} />
        </div>
        <h2 className="text-3xl font-serif text-amber-400">Sección Exclusiva para PC</h2>
        <p className="text-neutral-400 text-xs font-mono max-w-sm leading-relaxed">
          Esta función requiere una pantalla más grande (PC o Laptop) para manipular elementos y asignar asientos con precisión.
        </p>
      </div>

      {/* VISTA PARA ESCRITORIO */}
      <div className="hidden lg:block h-full">
        {children}
      </div>
    </>
  );
}