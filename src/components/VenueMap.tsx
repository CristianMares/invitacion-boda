'use client';
interface Table { id: string; table_number: number; pos_x: number; pos_y: number; capacity: number; }
interface Decoration { id: string; label: string; pos_x: number; pos_y: number; width: number; height: number; }

export default function VenueMap({ assignedTableIds, tables, decorations }: { assignedTableIds: string[], tables: Table[], decorations: Decoration[] }) {
  
  const assignedTableNumbers = tables
    .filter(t => assignedTableIds.includes(t.id))
    .map(t => t.table_number)
    .join(', ');

  return (
    <div className="w-full bg-[#FAF7F2] p-4 md:p-6 rounded-[2rem] border border-[#8C6239]/20 relative shadow-lg">
      <div className="text-center mb-6">
        <h4 className="text-[#8C6239] text-[10px] font-bold font-mono tracking-[0.2em] uppercase">Ubicación en Salón</h4>
        {assignedTableIds.length > 0 ? (
          <p className="text-[#4A3320] font-serif text-xl font-bold mt-1">MESA(S): {assignedTableNumbers}</p>
        ) : (
          <p className="text-red-800 font-serif text-sm mt-1">Sin mesa asignada</p>
        )}
      </div>

      <div className="w-full aspect-[16/10] bg-white border-2 border-[#8C6239]/30 rounded-xl md:rounded-2xl relative shadow-inner overflow-hidden">
        <div className="w-[1200px] h-[800px] relative transform scale-[0.25] sm:scale-[0.4] md:scale-[0.5] origin-top-left md:origin-center">
          
          {decorations.map(d => (
            <div key={d.id} className="absolute bg-[#F5EFE6] border-2 border-[#8C6239]/40 rounded flex items-center justify-center pointer-events-none shadow-sm"
                 style={{ left: `calc(${d.pos_x}% - ${d.width/2}%)`, top: `calc(${d.pos_y}% - ${d.height/2}%)`, width: `${d.width}%`, height: `${d.height}%` }}>
              <span className="text-3xl font-serif font-bold text-[#6B4E31] uppercase tracking-widest">{d.label}</span>
            </div>
          ))}

          {tables.map(t => {
            const isAssigned = assignedTableIds.includes(t.id);
            return (
              <div key={t.id} className={`absolute flex items-center justify-center rounded-full transition-all ${isAssigned ? 'z-20' : 'z-10'}`}
                   style={{ left: `calc(${t.pos_x}% - 40px)`, top: `calc(${t.pos_y}% - 40px)`, width: '80px', height: '80px' }}>
                
                {isAssigned && (
                  <>
                    <div className="absolute inset-[-20px] bg-[#8C6239]/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-[-10px] border-[3px] border-[#8C6239] border-dashed rounded-full animate-[spin_5s_linear_infinite]"></div>
                  </>
                )}

                <div className={`w-full h-full rounded-full flex items-center justify-center border-4 ${isAssigned ? 'bg-[#8C6239] border-[#4A3320] shadow-[0_0_20px_rgba(140,98,57,0.6)]' : 'bg-white border-[#D4C4B7]'}`}>
                  <span className={`font-serif font-bold ${isAssigned ? 'text-white text-3xl' : 'text-[#8C6239] text-2xl'}`}>{t.table_number}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}