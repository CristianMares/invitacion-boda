'use client';
import { useState } from 'react';
import { Users, ChevronDown, UserMinus, GripVertical, X } from 'lucide-react';

interface Person { id: string; name: string; type: 'guest' | 'companion'; table_id: string | null; group_id: string; }
interface Table { id: string; table_number: number; pos_x: number; pos_y: number; capacity: number; }
interface Decoration { id: string; label: string; pos_x: number; pos_y: number; width: number; height: number; rotation?: number; z_index?: number; }

export default function SeatingPlanUI({ initialPeople, tables, decorations }: { initialPeople: Person[], tables: Table[], decorations: Decoration[] }) {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const toggleGroup = (id: string) => setExpandedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);

  const handleDragStart = (e: React.DragEvent, id: string, type: string) => {
    e.dataTransfer.setData('dragId', id);
    e.dataTransfer.setData('dragType', type);
  };

  const handleDrop = async (e: React.DragEvent, tableId: string | null) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData('dragId');
    const dragType = e.dataTransfer.getData('dragType');

    if (dragType === 'group') {
      const membersToAssign = people.filter(p => p.group_id === dragId && p.table_id !== tableId);
      setPeople(prev => prev.map(p => p.group_id === dragId ? { ...p, table_id: tableId } : p));
      await Promise.all(membersToAssign.map(m => fetch('/api/admin/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personId: m.id, type: m.type, tableId }) })));
    } else {
      setPeople(prev => prev.map(p => p.id === dragId ? { ...p, table_id: tableId } : p));
      await fetch('/api/admin/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personId: dragId, type: dragType, tableId }) });
    }
  };

  const unassignPerson = async (personId: string, type: string) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, table_id: null } : p));
    await fetch('/api/admin/assign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personId, type, tableId: null }) });
  };

  const unassigned = people.filter(p => !p.table_id);
  const groupsInQueue = Array.from(new Set(unassigned.map(p => p.group_id)));

  return (
    <div className="flex flex-col md:flex-row h-full bg-black">
      <div className="w-full md:w-80 bg-neutral-950 border-r border-white/5 flex flex-col h-[40vh] md:h-full z-30 shadow-2xl" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, null)}>
        <div className="p-4 border-b border-white/5">
          <h2 className="text-amber-500 font-mono text-xs font-bold uppercase flex items-center gap-2"><Users size={16} /> Fila Asignación ({unassigned.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {groupsInQueue.map(groupId => {
            const members = unassigned.filter(p => p.group_id === groupId);
            const titular = members.find(m => m.type === 'guest') || people.find(p => p.id === groupId);
            const isExpanded = expandedGroups.includes(groupId);
            return (
              <div key={groupId} className="bg-black border border-white/5 rounded-xl overflow-hidden shadow-md">
                <div className="flex items-stretch bg-neutral-900">
                  <div draggable onDragStart={(e) => handleDragStart(e, groupId, 'group')} className="p-3 cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors">
                    <GripVertical size={16} className="pointer-events-none" />
                  </div>
                  <div onClick={() => toggleGroup(groupId)} className="flex-1 p-3 cursor-pointer flex justify-between items-center border-l border-white/5">
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">{titular?.name || 'Grupo'}</span>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span className="text-[10px] bg-black px-2 py-1 rounded font-mono">{members.length}</span>
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-2 bg-[#0a0a0a] space-y-2 border-t border-white/5">
                    {members.map(m => (
                      <div key={m.id} draggable onDragStart={(e) => handleDragStart(e, m.id, m.type)} className="p-2 bg-neutral-900 border border-neutral-800 rounded flex justify-between items-center cursor-grab active:cursor-grabbing hover:border-amber-500/50">
                        <span className="text-xs text-white truncate pointer-events-none">{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] overflow-auto relative p-4 md:p-10 flex">
        <div className="w-[1100px] h-[720px] bg-[#FAF7F2] border-2 border-[#8C6239]/30 rounded-2xl relative shadow-2xl flex-shrink-0 m-auto overflow-hidden">
          
          <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#8C6239]/20 shadow-lg text-[10px] font-mono space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border-2 border-[#D4C4B7]" /> Mesa Libre</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EAE0D5] border-2 border-[#8C6239]" /> Asignada (Incompleta)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#8C6239] border-2 border-[#4A3320]" /> Llena</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600 border-2 border-red-900" /> Sobrecupo</div>
          </div>

          {decorations.map(d => (
            <div key={d.id} className="absolute border-2 border-[#8C6239]/40 bg-[#F5EFE6] rounded flex items-center justify-center pointer-events-none"
                 style={{ left: `${d.pos_x}%`, top: `${d.pos_y}%`, transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`, width: `${d.width}%`, height: `${d.height}%`, zIndex: d.z_index || 10 }}>
              <span className="text-xs font-serif font-bold text-[#6B4E31] text-center uppercase">{d.label}</span>
            </div>
          ))}

          {tables.map(t => {
            const occupants = people.filter(p => p.table_id === t.id);
            const isFull = occupants.length === t.capacity;
            const isOver = occupants.length > t.capacity;
            const isPartial = occupants.length > 0 && occupants.length < t.capacity;

            let bgColor = 'bg-white';
            let borderColor = 'border-[#D4C4B7]';
            let textColor = 'text-[#8C6239]';

            if (isOver) { bgColor = 'bg-red-600'; borderColor = 'border-red-900'; textColor = 'text-white'; }
            else if (isFull) { bgColor = 'bg-[#8C6239]'; borderColor = 'border-[#4A3320]'; textColor = 'text-white'; }
            else if (isPartial) { bgColor = 'bg-[#EAE0D5]'; borderColor = 'border-[#8C6239]'; textColor = 'text-[#6B4E31]'; }

            return (
              <div key={t.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, t.id)} onClick={() => setSelectedTable(selectedTable === t.id ? null : t.id)}
                   className={`absolute w-[80px] h-[80px] border-4 rounded-full flex flex-col items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-110 ${bgColor} ${borderColor}`}
                   style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)', zIndex: selectedTable === t.id ? 200 : 150 }}>
                
                <span className={`font-serif font-bold text-2xl pointer-events-none ${textColor}`}>{t.table_number}</span>
                <span className={`text-[9px] font-mono font-bold pointer-events-none ${isFull || isOver ? 'text-white/80' : 'text-[#8C6239]/80'}`}>{occupants.length}/{t.capacity}</span>

                {selectedTable === t.id && (
                  <div className="absolute top-full mt-3 w-48 md:w-64 bg-neutral-900 border border-amber-500/50 p-4 rounded-xl shadow-2xl z-[300] cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                      <p className="text-xs text-amber-500 font-mono font-bold">MESA {t.table_number}</p>
                      <button onClick={() => setSelectedTable(null)} className="text-neutral-500 hover:text-white"><X size={14} /></button>
                    </div>
                    {occupants.length === 0 ? <p className="text-xs text-neutral-500 italic text-center">Mesa vacía</p> : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
                        {occupants.map(o => (
                          <div key={o.id} className="flex justify-between items-center bg-black/50 p-2 rounded border border-white/5">
                            <span className="text-[10px] md:text-xs text-white truncate max-w-[120px] md:max-w-[160px] font-medium">{o.name}</span>
                            <button onClick={() => unassignPerson(o.id, o.type)} className="text-neutral-500 hover:text-red-500 p-1.5"><UserMinus size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}