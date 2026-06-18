'use client';
interface Table { id: string; table_number: number; pos_x: number; pos_y: number; capacity: number; }
interface Decoration { id: string; label: string; pos_x: number; pos_y: number; width: number; height: number; }

export default function VenueMap({ assignedTableIds, tables, decorations }: { assignedTableIds: string[], tables: Table[], decorations: Decoration[] }) {
  
  // Nombres de las mesas asignadas para el encabezado
  const assignedTableNumbers = tables
    .filter(t => assignedTableIds.includes(t.id))
    .map(t => t.table_number)
    .join(', ');

  return (
    <div className="w-full bg-neutral-950 p-4 md:p-6 rounded-[2rem] border border-white/5 relative shadow-inner">
      <div className="text-center mb-4">
        <h4 className="text-amber-500 text-[10px] font-bold font-mono tracking-[0.2em] uppercase">Ubicación en Salón</h4>
        {assignedTableIds.length > 0 ? (
          <p className="text-white font-serif text-lg">MESA(S): {assignedTableNumbers}</p>
        ) : (
          <p className="text-red-400 font-serif text-sm">Sin mesa asignada</p>
        )}
      </div>

      <div className="w-full aspect-[16/10] bg-[#0a0a0a] border border-neutral-900 rounded-xl md:rounded-2xl relative shadow-2xl overflow-hidden">
        <div className="w-[1200px] h-[800px] relative transform scale-[0.25] sm:scale-[0.4] md:scale-[0.5] origin-center">
          
          {decorations.map(d => (
            <div key={d.id} className="absolute bg-[#111] border border-neutral-800/50 rounded flex items-center justify-center pointer-events-none"
                 style={{ left: `calc(${d.pos_x}% - ${d.width/2}%)`, top: `calc(${d.pos_y}% - ${d.height/2}%)`, width: `${d.width}%`, height: `${d.height}%` }}>
              <span className="text-3xl font-mono font-bold text-neutral-600 uppercase">{d.label}</span>
            </div>
          ))}

          {tables.map(t => {
            const isAssigned = assignedTableIds.includes(t.id);
            return (
              <div key={t.id} className={`absolute flex items-center justify-center rounded-full transition-all ${isAssigned ? 'z-20' : 'z-10'}`}
                   style={{ left: `calc(${t.pos_x}% - 40px)`, top: `calc(${t.pos_y}% - 40px)`, width: '80px', height: '80px' }}>
                
                {isAssigned && (
                  <>
                    <div className="absolute inset-[-20px] bg-amber-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-[-10px] border-[3px] border-amber-500 border-dashed rounded-full animate-[spin_5s_linear_infinite]"></div>
                  </>
                )}

                <div className={`w-full h-full rounded-full flex items-center justify-center border-4 ${isAssigned ? 'bg-amber-600 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.8)]' : 'bg-[#171717] border-neutral-700'}`}>
                  <span className={`font-serif font-bold ${isAssigned ? 'text-black text-3xl' : 'text-neutral-500 text-2xl'}`}>{t.table_number}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}