'use client';
import { useState, useEffect } from 'react';
import { Gift, CreditCard, ExternalLink, Copy, CheckCircle, RotateCw } from 'lucide-react';

export default function GiftRegistry() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({
    bank: { bank_name: 'BBVA', holder: 'Cristian Mares', clabe: '012180012345678901' },
    links: [
      { name: 'Amazon', url: 'https://www.amazon.com.mx' },
      { name: 'Liverpool', url: 'https://mesaderegalos.liverpool.com.mx' }
    ]
  });

  useEffect(() => {
    fetch('/api/admin/config').then(res => res.json()).then(data => {
      if (data.success && data.config?.gift_registry) {
        setConfig(data.config.gift_registry);
      }
    });
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(config.bank.clabe);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full min-h-[350px] [perspective:1000px]">
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-full duration-700 [transform-style:preserve-3d] cursor-pointer ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* FRENTE */}
        <div className="absolute inset-0 w-full h-full bg-neutral-900/60 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center space-y-6 flex flex-col items-center justify-center [backface-visibility:hidden] hover:border-amber-500/40 transition-colors shadow-2xl">
          <div className="w-20 h-20 bg-neutral-950 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <Gift size={32} />
          </div>
          <div>
            <h3 className="text-3xl font-serif text-white">Mesa de Regalos</h3>
            <p className="text-neutral-400 text-sm mt-2 max-w-xs mx-auto">
              Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros:
            </p>
          </div>
          <div className="px-6 py-3 bg-amber-600 text-black font-bold rounded-full hover:bg-amber-500 transition-all inline-flex items-center gap-2 text-xs uppercase tracking-widest shadow-lg">
            Ver Opciones &nbsp;<RotateCw size={14} />
          </div>
        </div>

        {/* REVERSO DINÁMICO */}
        <div className="absolute inset-0 w-full h-full bg-neutral-950 p-6 rounded-3xl border border-amber-500/30 text-white flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl overflow-y-auto">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-amber-500 text-xs font-mono font-bold uppercase tracking-widest">Opciones de Regalo</span>
            <span className="text-[10px] text-neutral-500 font-mono">Haz clic para voltear</span>
          </div>

          <div className="space-y-4 my-auto">
            {/* TRANSFERENCIA BANCARIA */}
            {config.bank?.clabe && (
              <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-neutral-200">Transferencia Bancaria</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">{config.bank.bank_name} • {config.bank.holder}</p>
                <div className="flex items-center justify-between bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                  <span className="text-xs font-mono text-amber-400 tracking-wider">{config.bank.clabe}</span>
                  <button onClick={handleCopy} className="p-1 hover:text-white transition-colors">
                    {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} className="text-neutral-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* LINKS EXTERNOS DINÁMICOS */}
            {config.links && config.links.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 text-left">Listas de Deseos</p>
                <div className="grid grid-cols-2 gap-2">
                  {config.links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2.5 bg-neutral-900 border border-white/10 hover:border-amber-500/50 rounded-xl flex items-center justify-between text-xs text-white font-medium transition-all"
                    >
                      <span className="truncate">{link.name}</span>
                      <ExternalLink size={12} className="text-amber-500 shrink-0 ml-1" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}