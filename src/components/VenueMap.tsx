'use client';
import { useState } from 'react';
import { Map, X, Maximize2 } from 'lucide-react';

interface Table { id: string; table_number: number; pos_x: number; pos_y: number; capacity: number; }
interface Decoration { id: string; label: string; pos_x: number; pos_y: number; width: number; height: number; bg_color?: string; rotation?: number; z_index?: number; }

export default function VenueMap({ assignedTableIds, tables, decorations }: { assignedTableIds: string[], tables: Table[], decorations: Decoration[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const assignedTableNumbers = tables
    .filter(t => assignedTableIds.includes(t.id))
    .map(t => t.table_number)
    .join(', ');

  return (
    <>
      {/* BOTÓN TARJETA EN EL TICKET */}
      <div className="w-full bg-black/60 p-6 rounded-3xl border border-amber-500/30 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <Map size={24} />
        </div>
        <div>
          <h4 className="text-amber-400 font-serif text-lg font-bold">Ubicación en Salón</h4>
          <p className="text-neutral-300 text-sm mt-1 font-mono">
            {assignedTableIds.length > 0 ? `TUS MESA(S): ${assignedTableNumbers}` : 'Sin mesa asignada'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Maximize2 size={16} /> Ver Mapa del Salón
        </button>
      </div>

      {/* MODAL FULLSCREEN CON CROQUIS FLUIDO */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[500] flex flex-col p-4 md:p-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4 text-white max-w-5xl mx-auto w-full">
            <div>
              <h3 className="text-xl font-serif text-amber-400">Plano General del Evento</h3>
              <p className="text-xs text-neutral-400 font-mono">Mesa(s) asignada(s): {assignedTableNumbers}</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 bg-neutral-900 border border-white/10 rounded-full hover:bg-neutral-800 text-neutral-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-2 rounded-2xl bg-[#0a0a0a] border border-white/10 relative">
            <div className="w-[1000px] h-[650px] bg-[#111111] border border-neutral-800 rounded-2xl relative shadow-2xl flex-shrink-0 overflow-hidden">
              {decorations.map(d => (
                <div
                  key={d.id}
                  className="absolute rounded flex items-center justify-center border border-white/10 pointer-events-none"
                  style={{
                    left: `${d.pos_x}%`,
                    top: `${d.pos_y}%`,
                    width: `${d.width}%`,
                    height: `${d.height}%`,
                    backgroundColor: d.bg_color || '#D4C4B7',
                    transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`,
                    zIndex: d.z_index || 10
                  }}
                >
                  <span className="text-[10px] font-mono font-bold text-neutral-800 uppercase tracking-widest text-center px-1">
                    {d.label}
                  </span>
                </div>
              ))}

              {tables.map(t => {
                const isAssigned = assignedTableIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`absolute w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isAssigned ? 'z-[300] scale-125' : 'z-[150]'
                    }`}
                    style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {isAssigned && (
                      <div className="absolute inset-[-12px] bg-amber-500/30 rounded-full animate-ping pointer-events-none" />
                    )}
                    <div className={`w-full h-full rounded-full flex items-center justify-center border-2 ${
                      isAssigned ? 'bg-amber-500 border-white shadow-[0_0_25px_rgba(245,158,11,0.9)]' : 'bg-[#262626] border-neutral-700'
                    }`}>
                      <span className={`font-serif font-bold text-base ${isAssigned ? 'text-black' : 'text-neutral-400'}`}>
                        {t.table_number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}