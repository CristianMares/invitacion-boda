'use client';
import { Gift, Lock } from 'lucide-react';
import { useState } from 'react';

export default function GiftRegistry() {
  const [showDevMsg, setShowDevMsg] = useState(false);

  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm p-10 rounded-3xl border border-white/10 text-center space-y-6 h-full flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-500/30 transition-colors">
      <div className="w-20 h-20 bg-neutral-950 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <Gift size={32} />
      </div>
      <h3 className="text-3xl font-serif text-white">Mesa de Regalos</h3>
      <p className="text-neutral-400">Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros:</p>
      
      <button 
        onClick={() => setShowDevMsg(true)}
        className="mt-4 px-8 py-4 bg-amber-600 text-white font-bold rounded-full hover:bg-amber-500 transition-colors inline-flex items-center gap-2 w-full justify-center"
      >
        <Lock size={18} /> Ver Opciones de Regalo
      </button>

      {showDevMsg && (
        <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-white animate-in fade-in duration-300 z-20">
          <Lock size={48} className="text-amber-500 mb-4" />
          <p className="font-serif text-2xl mb-2 text-white">Módulo Protegido</p>
          <p className="text-sm text-neutral-400 mb-6 text-center">La pasarela de aportaciones seguras se activará tras la confirmación de tus pases.</p>
          <button 
            onClick={() => setShowDevMsg(false)}
            className="text-xs uppercase font-bold tracking-widest border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}