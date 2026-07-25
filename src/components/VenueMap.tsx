'use client';
import { useState, useRef } from 'react';
import { Map, X, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Table { id: string; table_number: number; pos_x: number; pos_y: number; capacity: number; }
interface Decoration { id: string; label: string; pos_x: number; pos_y: number; width: number; height: number; rotation?: number; z_index?: number; }

export default function VenueMap({ assignedTableIds, tables, decorations }: { assignedTableIds: string[], tables: Table[], decorations: Decoration[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPointRef = useRef({ x: 0, y: 0 });

  const assignedTableNumbers = tables
    .filter(t => assignedTableIds.includes(t.id))
    .map(t => t.table_number)
    .join(', ');

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    startPointRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPointRef.current.x,
      y: e.clientY - startPointRef.current.y
    });
  };

  const handlePointerUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.6), 3.5));
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      {/* TARJETA DISPARADORA EN EL PASE */}
      <div className="w-full bg-neutral-900/90 p-6 rounded-3xl border border-amber-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          <Map size={24} />
        </div>
        <div>
          <h4 className="text-amber-400 font-serif text-xl font-bold">Ubicación en Salón</h4>
          <p className="text-neutral-300 text-sm mt-1 font-mono">
            {assignedTableIds.length > 0 ? `MESA(S) ASIGNADA(S): ${assignedTableNumbers}` : 'Sin mesa asignada'}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Maximize2 size={16} /> Navegar en Mapa Interactivo
        </button>
      </div>

      {/* VISOR MODAL TIPO GOOGLE MAPS */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[500] flex flex-col p-4 md:p-8 animate-in fade-in duration-300">
          
          {/* BARRA SUPERIOR */}
          <div className="flex justify-between items-center mb-4 text-white max-w-6xl mx-auto w-full">
            <div>
              <h3 className="text-2xl font-serif text-amber-400">Croquis Interactivo</h3>
              <p className="text-xs text-neutral-400 font-mono">Arrastra para moverte • Pellizca o usa la rueda para Zoom</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 bg-neutral-900 border border-white/10 rounded-full hover:bg-neutral-800 text-neutral-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* ÁREA INTERACTIVA (MAPS VIEWPORT) */}
          <div 
            className="flex-1 overflow-hidden relative rounded-3xl bg-[#080808] border border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* CONTROLES TIPO GOOGLE MAPS */}
            <div className="absolute bottom-6 right-6 z-[600] bg-neutral-900/90 border border-white/10 rounded-2xl flex flex-col p-1.5 shadow-2xl backdrop-blur-md">
              <button onClick={() => setZoom(z => Math.min(z + 0.25, 3.5))} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomIn size={20} /></button>
              <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.6))} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomOut size={20} /></button>
              <button onClick={resetViewport} className="p-3 text-white hover:text-amber-400" title="Centrar mapa"><RotateCcw size={18} /></button>
            </div>

            {/* CONTENEDOR TRANSFORMABLE */}
            <div 
              className="w-[1000px] h-[650px] bg-[#111111] border-2 border-neutral-800 rounded-2xl relative shadow-2xl flex-shrink-0 transition-transform duration-75"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            >
              {/* ESTRUCTURAS */}
              {decorations.map(d => (
                <div
                  key={d.id}
                  className="absolute rounded flex items-center justify-center border border-white/10 pointer-events-none bg-neutral-900/90"
                  style={{
                    left: `${d.pos_x}%`,
                    top: `${d.pos_y}%`,
                    width: `${d.width}%`,
                    height: `${d.height}%`,
                    transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`,
                    zIndex: d.z_index || 10
                  }}
                >
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest text-center px-1">
                    {d.label}
                  </span>
                </div>
              ))}

              {/* MESAS CON ANIMACIÓN VINTAGE RESTAURADA */}
              {tables.map(t => {
                const isAssigned = assignedTableIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`absolute flex items-center justify-center rounded-full transition-all ${
                      isAssigned ? 'z-[300]' : 'z-[150]'
                    }`}
                    style={{ 
                      left: `calc(${t.pos_x}% - 30px)`, 
                      top: `calc(${t.pos_y}% - 30px)`, 
                      width: '60px', 
                      height: '60px' 
                    }}
                  >
                    {/* ANIMACIÓN DE RADAR Y GIROSCOPIO RESTAURADA */}
                    {isAssigned && (
                      <>
                        <div className="absolute inset-[-16px] bg-amber-500/20 rounded-full animate-pulse" />
                        <div className="absolute inset-[-8px] border-[2px] border-amber-400 border-dashed rounded-full animate-[spin_6s_linear_infinite]" />
                      </>
                    )}

                    <div className={`w-full h-full rounded-full flex items-center justify-center border-2 ${
                      isAssigned 
                        ? 'bg-amber-500 border-white shadow-[0_0_30px_rgba(245,158,11,0.9)]' 
                        : 'bg-[#222] border-neutral-700'
                    }`}>
                      <span className={`font-serif font-bold text-base ${isAssigned ? 'text-black text-xl' : 'text-neutral-400'}`}>
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