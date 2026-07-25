'use client';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useRef } from "react";

export default function AdminDashboardInteractiveMap({ tables, decorations, enteredMap }: any) {
  const transformRef = useRef<any>(null);

  return (
    <div className="w-full h-[600px] bg-[#080808] border-2 border-neutral-900 rounded-3xl relative shadow-2xl overflow-hidden flex flex-col">
      <TransformWrapper 
        ref={transformRef}
        initialScale={0.8} 
        minScale={0.4} 
        maxScale={4} 
        centerOnInit
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* CONTROLES TIPO GOOGLE MAPS FLOTANTES */}
            <div className="absolute bottom-6 right-6 z-[600] bg-neutral-900/90 border border-white/10 rounded-2xl flex flex-col p-1.5 shadow-2xl backdrop-blur-md">
              <button onClick={() => zoomIn()} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomIn size={18} /></button>
              <button onClick={() => zoomOut()} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomOut size={18} /></button>
              <button onClick={() => resetTransform()} className="p-3 text-white hover:text-amber-400"><RotateCcw size={16} /></button>
            </div>

            {/* LIENZO TRANSFORMABLE FLUIDO */}
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              <div className="w-[1100px] h-[720px] bg-[#FAF7F2] border-2 border-[#8C6239]/30 rounded-2xl relative flex-shrink-0">
                
                {decorations.map((d: any) => (
                  <div
                    key={d.id}
                    className="absolute rounded flex items-center justify-center border-2 border-[#8C6239]/40 pointer-events-none bg-[#F5EFE6]"
                    style={{
                      left: `${d.pos_x}%`, top: `${d.pos_y}%`, width: `${d.width}%`, height: `${d.height}%`,
                      transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`, zIndex: d.z_index || 10
                    }}
                  >
                    <span className="text-[10px] font-serif font-bold text-[#6B4E31] uppercase tracking-widest text-center px-1">
                      {d.label}
                    </span>
                  </div>
                ))}

                {tables.map((t: any) => {
                  const entered = enteredMap[t.id] || 0;
                  const hasEnteredGuests = entered > 0;

                  return (
                    <div
                      key={t.id}
                      className={`absolute flex items-center justify-center rounded-full transition-all ${hasEnteredGuests ? 'z-[300]' : 'z-[150]'}`}
                      style={{ left: `calc(${t.pos_x}% - 40px)`, top: `calc(${t.pos_y}% - 40px)`, width: '80px', height: '80px' }}
                    >
                      {/* ANIMACIÓN DE SALÓN ACTIVO */}
                      {hasEnteredGuests && (
                        <>
                          <div className="absolute inset-[-20px] bg-[#8C6239]/20 rounded-full animate-pulse" />
                          <div className="absolute inset-[-10px] border-[3px] border-[#8C6239] border-dashed rounded-full animate-[spin_5s_linear_infinite]" />
                        </>
                      )}

                      <div className={`w-full h-full rounded-full flex items-center justify-center border-4 transition-all ${
                        hasEnteredGuests ? 'bg-[#8C6239] border-[#4A3320] shadow-[0_0_30px_rgba(140,98,57,0.8)]' : 'bg-white border-[#D4C4B7]'
                      }`}>
                        <span className={`font-serif font-bold text-3xl ${hasEnteredGuests ? 'text-white' : 'text-[#8C6239]'}`}>{t.table_number}</span>
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