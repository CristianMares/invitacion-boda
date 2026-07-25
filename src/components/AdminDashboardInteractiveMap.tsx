'use client';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function AdminDashboardInteractiveMap({ decorations, tables, assignedMap, enteredMap }: any) {
  return (
    <div className="w-full h-[600px] bg-[#050505] border border-white/10 rounded-3xl relative shadow-2xl overflow-hidden flex flex-col justify-center items-center">
      <TransformWrapper initialScale={0.85} minScale={0.3} maxScale={4} centerOnInit>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute bottom-6 right-6 z-[600] bg-neutral-900/90 border border-white/10 rounded-2xl flex flex-col p-1.5 shadow-2xl backdrop-blur-md">
              <button onClick={() => zoomIn()} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomIn size={18} /></button>
              <button onClick={() => zoomOut()} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomOut size={18} /></button>
              <button onClick={() => resetTransform()} className="p-3 text-white hover:text-amber-400"><RotateCcw size={16} /></button>
            </div>

            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              <div className="w-[1000px] h-[650px] bg-[#0d0d0d] border border-white/10 rounded-2xl relative shadow-2xl flex-shrink-0">
                
                {decorations.map((d: any) => (
                  <div
                    key={d.id}
                    className="absolute rounded flex items-center justify-center border border-white/10 pointer-events-none bg-neutral-900/90"
                    style={{
                      left: `${d.pos_x}%`, top: `${d.pos_y}%`, width: `${d.width}%`, height: `${d.height}%`,
                      transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`, zIndex: d.z_index || 10
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-amber-200/90 uppercase tracking-widest text-center px-1">
                      {d.label}
                    </span>
                  </div>
                ))}

                {tables.map((t: any) => {
                  const assigned = assignedMap[t.id] || 0;
                  const entered = enteredMap[t.id] || 0;
                  const hasEntered = entered > 0;
                  const isAssigned = assigned > 0;

                  return (
                    <div
                      key={t.id}
                      className={`absolute flex items-center justify-center rounded-full transition-all ${
                        hasEntered ? 'z-[300]' : isAssigned ? 'z-[200]' : 'z-[150]'
                      }`}
                      style={{ left: `calc(${t.pos_x}% - 28px)`, top: `calc(${t.pos_y}% - 28px)`, width: '56px', height: '56px' }}
                    >
                      {/* ANIMACIÓN VERDE ESMERALDA (GENTE EN SALÓN) */}
                      {hasEntered && (
                        <>
                          <div className="absolute inset-[-14px] bg-emerald-500/20 rounded-full animate-pulse" />
                          <div className="absolute inset-[-7px] border border-emerald-400 border-dashed rounded-full animate-[spin_5s_linear_infinite]" />
                        </>
                      )}

                      {/* ANIMACIÓN DENSIDAD ÁMBAR (SOLO PLANIFICADA) */}
                      {!hasEntered && isAssigned && (
                        <div className="absolute inset-[-6px] border border-amber-500/50 rounded-full animate-pulse" />
                      )}

                      <div className={`w-full h-full rounded-full flex flex-col items-center justify-center border-2 transition-all ${
                        hasEntered 
                          ? 'bg-emerald-600 border-white text-white shadow-[0_0_20px_rgba(16,185,129,0.9)]' 
                          : isAssigned 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                            : 'bg-neutral-900 border-neutral-700 text-neutral-500'
                      }`}>
                        <span className="font-serif font-bold text-base">{t.table_number}</span>
                        <span className="text-[8px] font-mono font-bold opacity-90">
                          {hasEntered ? `${entered} pres.` : `${assigned} asig.`}
                        </span>
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
  );
}