'use client';
import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, BoxSelect } from 'lucide-react';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tables' | 'decor'>('tables');
  
  const [dragging, setDragging] = useState<{ id: string, type: 'table' | 'decor' } | null>(null);
  const [resizing, setDraggingResize] = useState<{ id: string, handle: string, startX: number, startY: number, startW: number, startH: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/tables').then(res => res.json()).then(data => {
      if (data.success) { setTables(data.tables || []); setDecorations(data.decorations || []); }
      setLoading(false);
    });
  }, []);

  const handleSelectObject = (id: string, type: 'table' | 'decor', e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setSelectedId(id);
    setActiveTab(type === 'table' ? 'tables' : 'decor');
  };

  const handlePointerDown = (id: string, type: 'table' | 'decor', e: React.PointerEvent) => {
    e.stopPropagation();
    handleSelectObject(id, type);
    setDragging({ id, type });
  };

  const handleResizeStart = (id: string, handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const item = decorations.find(d => d.id === id);
    if (!item) return;
    setDraggingResize({
      id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startW: item.width,
      startH: item.height
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (dragging) {
      let x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      let y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      if (dragging.type === 'table') {
        setTables(prev => prev.map(t => t.id === dragging.id ? { ...t, pos_x: x, pos_y: y } : t));
      } else {
        setDecorations(prev => prev.map(d => d.id === dragging.id ? { ...d, pos_x: x, pos_y: y } : d));
      }
    }

    if (resizing) {
      const deltaXPercent = ((e.clientX - resizing.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - resizing.startY) / rect.height) * 100;

      setDecorations(prev => prev.map(d => {
        if (d.id !== resizing.id) return d;
        let newW = resizing.startW;
        let newH = resizing.startH;

        if (resizing.handle.includes('r')) newW = Math.max(4, resizing.startW + deltaXPercent);
        if (resizing.handle.includes('b')) newH = Math.max(4, resizing.startH + deltaYPercent);

        return { ...d, width: Math.round(newW), height: Math.round(newH) };
      }));
    }
  };

  const handlePointerUp = () => {
    setDragging(null);
    setDraggingResize(null);
  };

  const addTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    const newId = generateUUID();
    setTables([...tables, { id: newId, table_number: nextNum, pos_x: 50, pos_y: 50, capacity: 10 }]);
    handleSelectObject(newId, 'table');
  };

  const addDecoration = () => {
    const newId = generateUUID();
    setDecorations([...decorations, { id: newId, type: 'rect', label: 'NUEVA ÁREA', pos_x: 50, pos_y: 50, width: 20, height: 10, bg_color: '#D4C4B7', rotation: 0 }]);
    handleSelectObject(newId, 'decor');
  };

  const saveLayout = async () => {
    setSaving(true);
    await fetch('/api/admin/tables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tables, decorations })
    });
    setSaving(false);
    alert('Diseño guardado exitosamente.');
  };

  if (loading) return <div className="h-full flex items-center justify-center text-amber-500 font-mono">Cargando croquis...</div>;

  return (
    <div className="h-full flex flex-col md:flex-row bg-black text-white selection:bg-amber-500">
      {/* PANEL LATERAL */}
      <div className="w-full md:w-80 bg-neutral-950 border-r border-white/5 flex flex-col h-[45vh] md:h-full z-20 shadow-2xl flex-shrink-0">
        <div className="flex border-b border-white/5">
          <button onClick={() => setActiveTab('tables')} className={`flex-1 py-4 text-xs font-bold uppercase transition-all ${activeTab === 'tables' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-neutral-500'}`}>Mesas</button>
          <button onClick={() => setActiveTab('decor')} className={`flex-1 py-4 text-xs font-bold uppercase transition-all ${activeTab === 'decor' ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500' : 'text-neutral-500'}`}>Áreas</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'tables' ? (
            <>
              <button onClick={addTable} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-2 transition-all"><Plus size={16} /> Crear Mesa</button>
              {tables.map(t => (
                <div key={t.id} onClick={(e) => handleSelectObject(t.id, 'table', e)} className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${selectedId === t.id ? 'bg-amber-500/10 border-amber-500' : 'bg-black border-white/5'}`}>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold">Mesa {t.table_number}</p>
                    <button onClick={(e) => { e.stopPropagation(); setTables(tables.filter(x => x.id !== t.id)); if (selectedId === t.id) setSelectedId(null); }} className="text-neutral-600 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  {selectedId === t.id && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[10px] text-neutral-500">Capacidad personas:</span>
                      <input type="number" value={t.capacity} onChange={(e) => setTables(tables.map(tbl => tbl.id === t.id ? { ...tbl, capacity: Number(e.target.value) } : tbl))} className="w-16 bg-neutral-900 border border-neutral-700 text-xs px-2 py-1 rounded text-white outline-none" />
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <button onClick={addDecoration} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-2 transition-all"><BoxSelect size={16} /> Crear Área</button>
              {decorations.map(d => (
                <div key={d.id} onClick={(e) => handleSelectObject(d.id, 'decor', e)} className={`p-3 rounded-xl border space-y-2 transition-all cursor-pointer ${selectedId === d.id ? 'bg-amber-500/10 border-amber-500' : 'bg-black border-white/5'}`}>
                  <div className="flex justify-between items-center">
                    <input type="text" value={d.label} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, label: e.target.value } : dec))} className="bg-transparent text-xs font-bold w-3/4 outline-none border-b border-neutral-800 focus:border-amber-500" onClick={(e) => e.stopPropagation()} />
                    <button onClick={(e) => { e.stopPropagation(); setDecorations(decorations.filter(x => x.id !== d.id)); if (selectedId === d.id) setSelectedId(null); }} className="text-neutral-600 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  {selectedId === d.id && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                      <div><span className="text-[9px] text-neutral-500">ANCHO (%)</span><input type="number" value={d.width} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, width: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" /></div>
                      <div><span className="text-[9px] text-neutral-500">ALTO (%)</span><input type="number" value={d.height} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, height: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" /></div>
                      <div><span className="text-[9px] text-neutral-500">ROTACIÓN (°)</span><input type="number" value={d.rotation || 0} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, rotation: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" /></div>
                      <div><span className="text-[9px] text-neutral-500">COLOR</span><input type="color" value={d.bg_color || '#D4C4B7'} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, bg_color: e.target.value } : dec))} className="w-full h-6 bg-transparent cursor-pointer rounded" /></div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={saveLayout} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider">{saving ? 'Guardando...' : <><Save size={16} className="inline mr-1" /> Guardar Plano</>}</button>
        </div>
      </div>

      {/* LIENZO SVG */}
      <div 
        className="flex-1 bg-[#0a0a0a] overflow-auto p-4 md:p-8 flex items-center justify-center select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div 
          ref={containerRef}
          onClick={(e) => {
            if (e.target === containerRef.current) {
              setSelectedId(null);
            }
          }}
          className="w-[1000px] h-[650px] bg-[#FAF7F2] border-2 border-neutral-800 rounded-2xl relative shadow-2xl flex-shrink-0 overflow-hidden"
        >
          {decorations.map(d => {
            const isSelected = selectedId === d.id;
            return (
              <div
                key={d.id}
                onPointerDown={(e) => handlePointerDown(d.id, 'decor', e)}
                onClick={(e) => handleSelectObject(d.id, 'decor', e)}
                className={`absolute rounded flex items-center justify-center cursor-grab active:cursor-grabbing ${
                  isSelected ? 'ring-2 ring-amber-500 z-30' : 'z-10'
                }`}
                style={{
                  left: `${d.pos_x}%`,
                  top: `${d.pos_y}%`,
                  width: `${d.width}%`,
                  height: `${d.height}%`,
                  backgroundColor: d.bg_color || '#D4C4B7',
                  transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`,
                }}
              >
                <span className="text-[10px] font-mono font-bold text-neutral-800 uppercase tracking-widest text-center pointer-events-none px-1">
                  {d.label}
                </span>

                {isSelected && (
                  <div 
                    onPointerDown={(e) => handleResizeStart(d.id, 'rb', e)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 border border-black rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 z-50 shadow-md"
                  />
                )}
              </div>
            );
          })}

          {tables.map(t => {
            const isSelected = selectedId === t.id;
            return (
              <div
                key={t.id}
                onPointerDown={(e) => handlePointerDown(t.id, 'table', e)}
                onClick={(e) => handleSelectObject(t.id, 'table', e)}
                className={`absolute w-14 h-14 bg-[#165A72] border-2 border-[#0E3D4D] rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-md ${
                  isSelected ? 'ring-4 ring-amber-500 scale-110 z-40' : 'z-20'
                }`}
                style={{
                  left: `${t.pos_x}%`,
                  top: `${t.pos_y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span className="text-white font-serif font-bold text-base pointer-events-none">{t.table_number}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}