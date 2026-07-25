'use client';
import { useState, useRef } from 'react';
import { Map, X, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface Table { id: string; table_number: number; pos_x: number; pos_y: number; capacity: number; }
interface Decoration { id: string; label: string; pos_x: number; pos_y: number; width: number; height: number; rotation?: number; z_index?: number; }

export default function VenueMap({ assignedTableIds, tables, decorations }: { assignedTableIds: string[], tables: Table[], decorations: Decoration[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const transformRef = useRef<any>(null);

  const assignedTableNumbers = tables
    .filter(t => assignedTableIds.includes(t.id))
    .map(t => t.table_number)
    .join(', ');

  return (
    <>
      <div className="w-full bg-[#FAF7F2] p-6 rounded-3xl border border-[#8C6239]/20 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 bg-[#8C6239]/10 text-[#8C6239] rounded-full flex items-center justify-center mx-auto border border-[#8C6239]/20">
          <Map size={24} />
        </div>
        <div>
          <h4 className="text-[#4A3320] font-serif text-xl font-bold">Ubicación en Salón</h4>
          <p className="text-[#8C6239] text-sm mt-1 font-mono font-bold">
            {assignedTableIds.length > 0 ? `MESA(S): ${assignedTableNumbers}` : 'Sin mesa asignada'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-gradient-to-r from-[#8C6239] to-[#6B4E31] hover:from-[#6B4E31] hover:to-[#4A3320] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Maximize2 size={16} /> Abrir Mapa Interactivo
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[500] flex flex-col animate-in fade-in duration-300">
          
          <div className="absolute top-4 left-4 right-4 z-[600] flex justify-between items-center pointer-events-none">
            <div className="bg-neutral-900/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl pointer-events-auto shadow-2xl">
              <h3 className="text-amber-400 font-serif text-lg font-bold">Croquis de Salón</h3>
              <p className="text-xs text-neutral-300 font-mono">Mesa(s): <span className="text-white font-bold">{assignedTableNumbers}</span></p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-3 bg-neutral-900/90 border border-white/10 rounded-full hover:bg-neutral-800 text-white pointer-events-auto shadow-2xl">
              <X size={22} />
            </button>
          </div>

          <div className="w-full h-full relative">
            <TransformWrapper ref={transformRef} initialScale={0.8} minScale={0.3} maxScale={4} centerOnInit>
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute bottom-6 right-6 z-[600] bg-neutral-900/90 border border-white/10 rounded-2xl flex flex-col p-1.5 shadow-2xl backdrop-blur-md">
                    <button onClick={() => zoomIn()} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomIn size={20} /></button>
                    <button onClick={() => zoomOut()} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomOut size={20} /></button>
                    <button onClick={() => resetTransform()} className="p-3 text-white hover:text-amber-400"><RotateCcw size={18} /></button>
                  </div>

                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                    <div className="w-[1100px] h-[720px] bg-[#FAF7F2] border-2 border-[#8C6239]/30 rounded-2xl relative shadow-2xl flex-shrink-0">
                      
                      {decorations.map(d => (
                        <div key={d.id} className="absolute rounded flex items-center justify-center border-2 border-[#8C6239]/40 pointer-events-none bg-[#F5EFE6] shadow-sm"
                             style={{ left: `${d.pos_x}%`, top: `${d.pos_y}%`, width: `${d.width}%`, height: `${d.height}%`, transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`, zIndex: d.z_index || 10 }}>
                          <span className="text-xs font-serif font-bold text-[#6B4E31] uppercase tracking-widest text-center px-1">{d.label}</span>
                        </div>
                      ))}

                      {tables.map(t => {
                        const isAssigned = assignedTableIds.includes(t.id);
                        return (
                          <div key={t.id} className={`absolute flex items-center justify-center rounded-full transition-all ${isAssigned ? 'z-[300]' : 'z-[150]'}`}
                               style={{ left: `calc(${t.pos_x}% - 40px)`, top: `calc(${t.pos_y}% - 40px)`, width: '80px', height: '80px' }}>
                            {isAssigned && (
                              <>
                                <div className="absolute inset-[-20px] bg-[#8C6239]/20 rounded-full animate-pulse" />
                                <div className="absolute inset-[-10px] border-[3px] border-[#8C6239] border-dashed rounded-full animate-[spin_5s_linear_infinite]" />
                              </>
                            )}
                            <div className={`w-full h-full rounded-full flex items-center justify-center border-4 transition-all ${isAssigned ? 'bg-[#8C6239] border-[#4A3320] shadow-[0_0_30px_rgba(140,98,57,0.8)] scale-110' : 'bg-white border-[#D4C4B7]'}`}>
                              <span className={`font-serif font-bold ${isAssigned ? 'text-white text-3xl' : 'text-[#8C6239] text-2xl'}`}>{t.table_number}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
}