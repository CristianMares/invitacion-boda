'use client';
import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, BoxSelect, ArrowUp, ArrowDown, Layers } from 'lucide-react';

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
  
  // Arreglo de IDs seleccionados
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'tables' | 'decor'>('tables');
  
  const [dragging, setDragging] = useState<{ primaryId: string, offsets: Record<string, { x: number, y: number }> } | null>(null);
  const [resizing, setDraggingResize] = useState<{ id: string, handle: string, startX: number, startY: number, startW: number, startH: number } | null>(null);

  const wasResizingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/tables').then(res => res.json()).then(data => {
      if (data.success) { setTables(data.tables || []); setDecorations(data.decorations || []); }
      setLoading(false);
    });
  }, []);

  const handleSelectObject = (id: string, type: 'table' | 'decor', e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    setActiveTab(type === 'table' ? 'tables' : 'decor');

    if (e.shiftKey) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      if (!selectedIds.includes(id)) {
        setSelectedIds([id]);
      }
    }
  };

  const handlePointerDown = (id: string, type: 'table' | 'decor', e: React.PointerEvent) => {
    e.stopPropagation();
    if (!selectedIds.includes(id) && !e.shiftKey) {
      setSelectedIds([id]);
    }
    setActiveTab(type === 'table' ? 'tables' : 'decor');

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const currentSelection = selectedIds.includes(id) ? selectedIds : [id];
    const offsets: Record<string, { x: number, y: number }> = {};

    currentSelection.forEach(sId => {
      const item = tables.find(t => t.id === sId) || decorations.find(d => d.id === sId);
      if (item) {
        offsets[sId] = { x: clickX - item.pos_x, y: clickY - item.pos_y };
      }
    });

    setDragging({ primaryId: id, offsets });
  };

  const handleResizeStart = (id: string, handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    wasResizingRef.current = true;
    const item = decorations.find(d => d.id === id);
    if (!item) return;
    setDraggingResize({ id, handle, startX: e.clientX, startY: e.clientY, startW: item.width, startH: item.height });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (dragging) {
      const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
      const cursorY = ((e.clientY - rect.top) / rect.height) * 100;

      Object.keys(dragging.offsets).forEach(sId => {
        const offset = dragging.offsets[sId];
        let targetX = Math.round(cursorX - offset.x);
        let targetY = Math.round(cursorY - offset.y);

        targetX = Math.max(0, Math.min(100, targetX));
        targetY = Math.max(0, Math.min(100, targetY));

        setTables(prev => prev.map(t => t.id === sId ? { ...t, pos_x: targetX, pos_y: targetY } : t));
        setDecorations(prev => prev.map(d => d.id === sId ? { ...d, pos_x: targetX, pos_y: targetY } : d));
      });
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
    setTimeout(() => { wasResizingRef.current = false; }, 100);
  };

  const applyBatchDecorationChange = (key: string, value: any) => {
    setDecorations(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, [key]: value } : d));
  };

  const addTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    const newId = generateUUID();
    setTables([...tables, { id: newId, table_number: nextNum, pos_x: 50, pos_y: 50, capacity: 10 }]);
    setSelectedIds([newId]);
    setActiveTab('tables');
  };

  const addDecoration = () => {
    const newId = generateUUID();
    setDecorations([...decorations, { id: newId, type: 'rect', label: 'NUEVA ÁREA', pos_x: 50, pos_y: 50, width: 20, height: 10, bg_color: '#D4C4B7', rotation: 0, z_index: 10 }]);
    setSelectedIds([newId]);
    setActiveTab('decor');
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

        {/* BARRAS Y CONTROLES DE EDICIÓN MULTIPLE */}
        {selectedIds.length > 1 && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 text-xs space-y-2">
            <div className="flex justify-between items-center text-amber-400 font-mono font-bold">
              <span>{selectedIds.length} Elementos Selecciónados</span>
              <button onClick={() => setSelectedIds([])} className="text-neutral-400 hover:text-white text-[10px]">Desmarcar</button>
            </div>
            {activeTab === 'decor' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[9px] text-neutral-400">CAMBIAR COLOR LOTE</span>
                  <input type="color" onChange={(e) => applyBatchDecorationChange('bg_color', e.target.value)} className="w-full h-6 bg-transparent cursor-pointer rounded" />
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400">ROTACIÓN LOTE (°)</span>
                  <input type="number" onChange={(e) => applyBatchDecorationChange('rotation', Number(e.target.value))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'tables' ? (
            <>
              <button onClick={addTable} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-2 transition-all"><Plus size={16} /> Crear Mesa</button>
              {tables.map(t => {
                const isSelected = selectedIds.includes(t.id);
                return (
                  <div key={t.id} onClick={(e) => handleSelectObject(t.id, 'table', e)} className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${isSelected ? 'bg-amber-500/10 border-amber-500' : 'bg-black border-white/5'}`}>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold">Mesa {t.table_number}</p>
                      <button onClick={(e) => { e.stopPropagation(); setTables(tables.filter(x => x.id !== t.id)); setSelectedIds(prev => prev.filter(x => x !== t.id)); }} className="text-neutral-600 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              <button onClick={addDecoration} className="w-full bg-neutral-900 border border-white/10 py-3 rounded-xl flex justify-center gap-2 hover:bg-white hover:text-black font-bold mb-2 transition-all"><BoxSelect size={16} /> Crear Área</button>
              {decorations.map(d => {
                const isSelected = selectedIds.includes(d.id);
                return (
                  <div key={d.id} onClick={(e) => handleSelectObject(d.id, 'decor', e)} className={`p-3 rounded-xl border space-y-2 transition-all cursor-pointer ${isSelected ? 'bg-amber-500/10 border-amber-500' : 'bg-black border-white/5'}`}>
                    <div className="flex justify-between items-center">
                      <input type="text" value={d.label} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, label: e.target.value } : dec))} className="bg-transparent text-xs font-bold w-3/4 outline-none border-b border-neutral-800 focus:border-amber-500" onClick={(e) => e.stopPropagation()} />
                      <button onClick={(e) => { e.stopPropagation(); setDecorations(decorations.filter(x => x.id !== d.id)); setSelectedIds(prev => prev.filter(x => x !== d.id)); }} className="text-neutral-600 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                    {isSelected && selectedIds.length === 1 && (
                      <div className="space-y-3 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-2">
                          <div><span className="text-[9px] text-neutral-500">ANCHO (%)</span><input type="number" value={d.width} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, width: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" /></div>
                          <div><span className="text-[9px] text-neutral-500">ALTO (%)</span><input type="number" value={d.height} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, height: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" /></div>
                          <div><span className="text-[9px] text-neutral-500">ROTACIÓN (°)</span><input type="number" value={d.rotation || 0} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, rotation: Number(e.target.value) } : dec))} className="w-full bg-neutral-900 text-xs p-1 rounded text-white" /></div>
                          <div><span className="text-[9px] text-neutral-500">COLOR</span><input type="color" value={d.bg_color || '#D4C4B7'} onChange={(e) => setDecorations(decorations.map(dec => dec.id === d.id ? { ...dec, bg_color: e.target.value } : dec))} className="w-full h-6 bg-transparent cursor-pointer rounded" /></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
            if (e.target === containerRef.current && !wasResizingRef.current) {
              setSelectedIds([]);
            }
          }}
          className="w-[1000px] h-[650px] bg-[#FAF7F2] border-2 border-neutral-800 rounded-2xl relative shadow-2xl flex-shrink-0 overflow-hidden"
        >
          {decorations.map(d => {
            const isSelected = selectedIds.includes(d.id);
            return (
              <div
                key={d.id}
                onPointerDown={(e) => handlePointerDown(d.id, 'decor', e)}
                onClick={(e) => handleSelectObject(d.id, 'decor', e)}
                className={`absolute rounded flex items-center justify-center cursor-grab active:cursor-grabbing ${
                  isSelected ? 'ring-2 ring-amber-500' : ''
                }`}
                style={{
                  left: `${d.pos_x}%`,
                  top: `${d.pos_y}%`,
                  width: `${d.width}%`,
                  height: `${d.height}%`,
                  backgroundColor: d.bg_color || '#D4C4B7',
                  transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg)`,
                  zIndex: isSelected ? 99 : (d.z_index || 10)
                }}
              >
                <span className="text-[10px] font-mono font-bold text-neutral-800 uppercase tracking-widest text-center pointer-events-none px-1">
                  {d.label}
                </span>

                {isSelected && selectedIds.length === 1 && (
                  <div 
                    onPointerDown={(e) => handleResizeStart(d.id, 'rb', e)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 border border-black rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 z-[100] shadow-md"
                  />
                )}
              </div>
            );
          })}

          {tables.map(t => {
            const isSelected = selectedIds.includes(t.id);
            return (
              <div
                key={t.id}
                onPointerDown={(e) => handlePointerDown(t.id, 'table', e)}
                onClick={(e) => handleSelectObject(t.id, 'table', e)}
                className={`absolute w-14 h-14 bg-[#165A72] border-2 border-[#0E3D4D] rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-md ${
                  isSelected ? 'ring-4 ring-amber-500 scale-110 z-[200]' : 'z-[150]'
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