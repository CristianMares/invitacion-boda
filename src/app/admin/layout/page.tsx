'use client';
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, LayoutTemplate, BoxSelect } from 'lucide-react';
import dynamic from 'next/dynamic';

// Importación dinámica obligatoria para evitar errores de renderizado en el servidor
const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false });

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

  useEffect(() => {
    fetch('/api/admin/tables').then(res => res.json()).then(data => {
      if (data.success) { setTables(data.tables || []); setDecorations(data.decorations || []); }
      setLoading(false);
    });
  }, []);

  const addTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    setTables([...tables, { id: generateUUID(), table_number: nextNum, pos_x: 50, pos_y: 50, capacity: 10 }]);
  };

  const addDecoration = () => {
    setDecorations([...decorations, { id: generateUUID(), type: 'rect', label: 'NUEVA ÁREA', pos_x: 50, pos_y: 50, width: 20, height: 10, bg_color: '#E8A881', rotation: 0 }]);
  };

  const saveLayout = async () => {
    setSaving(true);
    await fetch('/api/admin/tables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tables, decorations })
    });
    setSaving(false);
    alert('Motor gráfico sincronizado con la base de datos.');
  };

  if (loading) return <div className="h-full flex items-center justify-center text-amber-500 font-mono">Cargando Konva API...</div>;

  return (
    <div className="h-full flex flex-col md:flex-row bg-black">
      <div className="w-full md:w-96 bg-neutral-950 border-r border-white/5 flex flex-col h-[45vh] md:h-full z-20 shadow-2xl flex-shrink-0">
        <div className="flex border-b border-white/5">
          <button onClick={() => setActiveTab('tables')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'tables' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-neutral-500'}`}>Mesas</button>
          <button onClick={() => setActiveTab('decor')} className={`flex-1 py-4 text-xs font-bold uppercase ${activeTab === 'decor' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-neutral-500'}`}>Áreas</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
          {activeTab === 'tables' ? (
            <>
              <button onClick={addTable} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-4"><Plus size={18} /> Añadir Mesa</button>
              {tables.map(t => (
                <div key={t.id} className="bg-black border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">Mesa {t.table_number}</span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-neutral-500">CAP:</span>
                      <input type="number" value={t.capacity} onChange={(e) => setTables(tables.map(tbl => tbl.id === t.id ? { ...tbl, capacity: Number(e.target.value) } : tbl))} className="w-16 bg-neutral-900 border border-neutral-700 text-xs px-2 py-1 rounded text-white outline-none" />
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
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <input type="text" value={d.label} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, label: e.target.value } : dec))} className="bg-transparent text-sm font-bold w-full text-white outline-none" placeholder="Nombre" />
                    <button onClick={() => setDecorations(decorations.filter(x => x.id !== d.id))} className="text-neutral-600 hover:text-red-500 ml-2"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[9px] text-neutral-500">COLOR HEX</span><input type="text" value={d.bg_color || '#E8A881'} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, bg_color: e.target.value } : dec))} className="w-full bg-neutral-900 border border-neutral-700 text-xs px-2 py-1 rounded text-white" /></div>
                  </div>
                  <p className="text-[9px] text-neutral-500 mt-2 text-center">Selecciona el objeto en el lienzo para escalar o rotar.</p>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="p-4 border-t border-white/5">
          <button onClick={saveLayout} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">{saving ? 'Guardando...' : 'Guardar Diseño Base'}</button>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0a] overflow-auto relative p-4 md:p-10 flex">
        <div className="m-auto border-[4px] border-neutral-800 rounded-lg shadow-2xl overflow-hidden">
          <CanvasEditor tables={tables} decorations={decorations} setTables={setTables} setDecorations={setDecorations} />
        </div>
      </div>
    </div>
  );
}