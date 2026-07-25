'use client';
import { MonitorX } from 'lucide-react';

export default function PCOnlyGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* PANTALLA DE BLOQUEO EN MÓVILES */}
      <div className="lg:hidden h-full w-full bg-black text-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shadow-2xl">
          <MonitorX size={32} />
        </div>
        <h2 className="text-2xl font-serif text-amber-400">Acceso Restringido a PC</h2>
        <p className="text-neutral-400 text-xs font-mono max-w-sm leading-relaxed">
          Esta sección requiere alta precisión de cursor. Por favor, ingresa desde una computadora de escritorio o laptop para diseñar el salón o asignar mesas.
        </p>
      </div>

      {/* CONTENIDO SOLO EN ESCRITORIO */}
      <div className="hidden lg:block h-full">
        {children}
      </div>
    </>
  );
}