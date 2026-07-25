'use client';
import { Gift, CreditCard, ShoppingBag, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function GiftRegistry() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('012180012345678901');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm p-8 rounded-3xl border border-white/10 h-full flex flex-col relative overflow-hidden group hover:border-amber-500/30 transition-colors">
      <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div className="w-12 h-12 bg-neutral-950 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.1)] shrink-0">
          <Gift size={20} />
        </div>
        <div className="text-left">
          <h3 className="text-2xl font-serif text-white">Mesa de Regalos</h3>
          <p className="text-neutral-400 text-xs font-mono">El mejor regalo es tu presencia.</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Módulo Transaccional Directo */}
        <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={14} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Transferencia</span>
          </div>
          <div className="space-y-1 text-sm font-mono text-neutral-400">
            <p>Banco: <span className="text-white">BBVA</span></p>
            <p>Titular: <span className="text-white">Cristian Mares</span></p>
            <div className="flex items-center justify-between mt-2 bg-neutral-950 p-2 rounded-lg border border-neutral-800">
              <span className="text-amber-500 tracking-wider">012180012345678901</span>
              <button onClick={handleCopy} className="text-neutral-500 hover:text-white transition-colors">
                {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Módulo Agregador Externo */}
        <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={14} className="text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Mesa en Tiendas</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a href="#" target="_blank" className="flex items-center justify-center gap-2 bg-white text-black py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-colors">
              Liverpool <ExternalLink size={12} />
            </a>
            <a href="#" target="_blank" className="flex items-center justify-center gap-2 bg-neutral-800 text-white py-2 rounded-xl text-xs font-bold hover:bg-neutral-700 transition-colors">
              Amazon <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}