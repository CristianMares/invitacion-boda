'use client';
import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, LayoutTemplate, BoxSelect } from 'lucide-react';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function LayoutBuilder() {
  const [tables, setTables] = useState<any[]>([]);
  const [decorations, setDecorations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'decor'>('tables');
  const [draggingItem, setDraggingItem] = useState<{id: string, type: 'table'|'decor'} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/tables').then(res => res.json()).then(data => {
      if (data.success) { setTables(data.tables || []); setDecorations(data.decorations || []); }
      setLoading(false);
    });
  }, []);

  const handlePointerDown = (id: string, type: 'table'|'decor', e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingItem({id, type});
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingItem || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (draggingItem.type === 'table') {
      setTables(prev => prev.map(t => t.id === draggingItem.id ? { ...t, pos_x: x, pos_y: y } : t));
    } else {
      setDecorations(prev => prev.map(d => d.id === draggingItem.id ? { ...d, pos_x: x, pos_y: y } : d));
    }
  };

  const handlePointerUp = () => setDraggingItem(null);

  const addTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    setTables([...tables, { id: generateUUID(), table_number: nextNum, pos_x: 50, pos_y: 50, capacity: 10 }]);
  };

  const addDecoration = () => {
    setDecorations([...decorations, { id: generateUUID(), type: 'rect', label: 'NUEVA ÁREA', pos_x: 50, pos_y: 50, width: 20, height: 10 }]);
  };

  const saveLayout = async () => {
    setSaving(true);
    await fetch('/api/admin/tables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tables, decorations })
    });
    setSaving(false);
    alert('Plano actualizado.');
  };

  if (loading) return <div className="h-full flex items-center justify-center text-amber-500 font-mono">Cargando motor gráfico...</div>;

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* PANEL DE EDICIÓN */}
      <div className="w-full md:w-80 bg-neutral-950 border-r border-white/5 flex flex-col h-[40vh] md:h-full z-20 shadow-2xl">
        <div className="flex border-b border-white/5">
          <button onClick={() => setActiveTab('tables')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'tables' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-neutral-500'}`}>Mesas</button>
          <button onClick={() => setActiveTab('decor')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'decor' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-neutral-500'}`}>Áreas</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'tables' ? (
            <>
              <button onClick={addTable} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-4"><Plus size={18} /> Añadir Mesa</button>
              {tables.map(t => (
                <div key={t.id} className="bg-black border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">Mesa {t.table_number}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-neutral-500">CAPACIDAD:</span>
                      <input type="number" value={t.capacity} onChange={(e) => setTables(tables.map(tbl => tbl.id === t.id ? { ...tbl, capacity: Number(e.target.value) } : tbl))} className="w-16 bg-neutral-900 border border-neutral-700 text-xs px-2 py-1 rounded text-white" />
                    </div>
                  </div>
                  <button onClick={() => setTables(tables.filter(x => x.id !== t.id))} className="text-neutral-600 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </>
          ) : (
            <>
              <button onClick={addDecoration} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-4"><BoxSelect size={18} /> Añadir Área</button>
              {decorations.map(d => (
                <div key={d.id} className="bg-black border border-white/5 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <input type="text" value={d.label} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, label: e.target.value } : dec))} className="bg-transparent border-b border-neutral-800 text-sm font-bold w-2/3 text-white" placeholder="Nombre" />
                    <button onClick={() => setDecorations(decorations.filter(x => x.id !== d.id))} className="text-neutral-600 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1"><span className="text-[9px] text-neutral-500">ANCHO (%)</span><input type="number" value={d.width} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, width: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 border border-neutral-700 text-xs px-2 py-1 rounded text-white" /></div>
                    <div className="flex-1"><span className="text-[9px] text-neutral-500">ALTO (%)</span><input type="number" value={d.height} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, height: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 border border-neutral-700 text-xs px-2 py-1 rounded text-white" /></div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="p-4 border-t border-white/5">
          <button onClick={saveLayout} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-4 rounded-xl">{saving ? 'Guardando...' : 'Guardar Plano'}</button>
        </div>
      </div>

      {/* LIENZO RESPONSIVO */}
      <div className="flex-1 bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-4 md:p-8" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <div ref={containerRef} className="w-full max-w-5xl aspect-[16/10] bg-neutral-950 border-2 border-dashed border-neutral-800 rounded-3xl relative shadow-2xl overflow-hidden touch-none">
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

          {decorations.map(d => (
            <div key={d.id} onPointerDown={(e) => handlePointerDown(d.id, 'decor', e)} className="absolute bg-[#111] border-2 border-neutral-800 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-neutral-500 transition-colors"
                 style={{ left: `${d.pos_x}%`, top: `${d.pos_y}%`, transform: 'translate(-50%, -50%)', width: `${d.width}%`, height: `${d.height}%`, zIndex: draggingItem?.id === d.id ? 40 : 5 }}>
              <span className="text-[10px] md:text-sm font-mono font-bold text-neutral-500 uppercase pointer-events-none text-center">{d.label}</span>
            </div>
          ))}

          {tables.map(t => (
            <div key={t.id} onPointerDown={(e) => handlePointerDown(t.id, 'table', e)} className="absolute w-12 h-12 md:w-16 md:h-16 bg-neutral-900 border-2 border-amber-500/50 rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:border-amber-500 shadow-xl"
                 style={{ left: `${t.pos_x}%`, top: `${t.pos_y}%`, transform: 'translate(-50%, -50%)', zIndex: draggingItem?.id === t.id ? 50 : 10 }}>
              <span className="text-white font-serif font-bold text-sm md:text-lg pointer-events-none">{t.table_number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}