'use client';
import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function AdminDashboardInteractiveMap({ tables, decorations, assignedMap, enteredMap }: any) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPointRef = useRef({ x: 0, y: 0 });

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

  return (
    <div 
      className="w-full h-[600px] bg-[#080808] border-2 border-neutral-900 rounded-3xl relative shadow-2xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="absolute bottom-6 right-6 z-[600] bg-neutral-900/90 border border-white/10 rounded-2xl flex flex-col p-1.5 shadow-2xl backdrop-blur-md">
        <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomIn size={18} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.6))} className="p-3 text-white hover:text-amber-400 border-b border-white/10"><ZoomOut size={18} /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-3 text-white hover:text-amber-400"><RotateCcw size={16} /></button>
      </div>

      <div 
        className="w-[1000px] h-[650px] bg-[#FAF7F2] border-2 border-[#8C6239]/30 rounded-2xl relative shadow-2xl flex-shrink-0 transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {decorations.map((d: any) => (
          <div
            key={d.id}
            className="absolute rounded flex items-center justify-center border-2 border-[#8C6239]/40 pointer-events-none bg-[#F5EFE6]"
            style={{
              left: `${d.pos_x}%`,
              top: `${d.pos_y}%`,
              width: `${d.width}%`,
              height: `${d.height}%`,
              transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`,
              zIndex: d.z_index || 10
            }}
          >
            <span className="text-[10px] font-serif font-bold text-[#6B4E31] uppercase tracking-widest text-center px-1">
              {d.label}
            </span>
          </div>
        ))}

        {tables.map((t: any) => {
          const assigned = assignedMap[t.id] || 0;
          const entered = enteredMap[t.id] || 0;
          const hasEnteredGuests = entered > 0;
          const isAssigned = assigned > 0;

          let bgStyle = 'bg-white border-[#D4C4B7] text-[#8C6239]';
          if (hasEnteredGuests) {
            bgStyle = 'bg-emerald-600 border-white text-white shadow-[0_0_20px_rgba(16,185,129,0.8)]';
          } else if (isAssigned) {
            bgStyle = 'bg-[#8C6239] border-[#4A3320] text-white';
          }

          return (
            <div
              key={t.id}
              className="absolute w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all z-[150]"
              style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span className={`font-serif font-bold text-base ${bgStyle}`}>{t.table_number}</span>
              <span className="text-[8px] font-mono font-bold opacity-80">{entered}/{assigned}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}