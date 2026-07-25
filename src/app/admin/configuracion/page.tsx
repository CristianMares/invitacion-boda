'use client';
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calendar, MapPin, Gift, Clock, ShieldCheck, Shirt, ArrowUp, ArrowDown, Eye, X, ExternalLink } from 'lucide-react';
import Timeline from '@/components/Timeline';
import DressCode from '@/components/DressCode';
import GiftRegistry from '@/components/GiftRegistry';

export default function AdminConfiguracion() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [activePreviewModal, setActivePreviewModal] = useState<string | null>(null);

  const [weddingDate, setWeddingDate] = useState('2026-12-31T20:00:00');
  const [venueInfo, setVenueInfo] = useState({ name: '', location: '', maps_url: '' });
  const [dressCode, setDressCode] = useState({ title: '', note: '', colors: [] as string[] });
  const [giftRegistry, setGiftRegistry] = useState({
    bank: { bank_name: '', holder: '', clabe: '' },
    links: [] as Array<{ name: string, url: string }>
  });
  const [itinerary, setItinerary] = useState([] as Array<{ time: string, title: string, desc: string }>);

  useEffect(() => {
    fetch('/api/admin/config').then(res => res.json()).then(data => {
      if (data.success && data.config) {
        if (data.config.wedding_date) setWeddingDate(data.config.wedding_date);
        if (data.config.venue_info) setVenueInfo(data.config.venue_info);
        if (data.config.dress_code) setDressCode(data.config.dress_code);
        if (data.config.gift_registry) setGiftRegistry(data.config.gift_registry);
        if (data.config.itinerary) setItinerary(data.config.itinerary);
      }
      setLoading(false);
    });
  }, []);

  const saveConfigSection = async (key: string, value: any) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      if (data.success) alert('Sección guardada en base de datos.');
      else alert('Error de autorización o servidor.');
    } catch {
      alert('Error de conexión.');
    } finally {
      setSavingKey(null);
    }
  };

  // Reordenar Itinerario
  const moveItineraryItem = (index: number, direction: 'up' | 'down') => {
    const list = [...itinerary];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setItinerary(list);
  };

  // Reordenar Colores de Vestimenta
  const moveColorItem = (index: number, direction: 'up' | 'down') => {
    const list = [...dressCode.colors];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setDressCode({ ...dressCode, colors: list });
  };

  // Reordenar Links de Regalos
  const moveLinkItem = (index: number, direction: 'up' | 'down') => {
    const list = [...giftRegistry.links];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setGiftRegistry({ ...giftRegistry, links: list });
  };

  if (loading) return <div className="h-full flex items-center justify-center text-amber-500 font-mono">Cargando CMS...</div>;

  return (
    <div className="h-full bg-black text-white p-4 md:p-10 overflow-y-auto selection:bg-amber-500 selection:text-black">
      <div className="max-w-4xl mx-auto pb-24 space-y-10">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">Configuración del Sitio</h1>
            <p className="text-neutral-500 text-xs mt-1 font-mono">Gestión dinámica de itinerario, dresscode, recepción y mesa de regalos.</p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Protección SSL</span>
          </div>
        </div>

        {/* 1. FECHA Y HORA */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Calendar size={18} /> Fecha y Cuenta Regresiva</h3>
            <div className="flex gap-2">
              <button onClick={() => setActivePreviewModal('date')} className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs flex items-center gap-1 border border-white/10">
                <Eye size={14} /> Previsualizar
              </button>
              <button onClick={() => saveConfigSection('wedding_date', weddingDate)} disabled={savingKey === 'wedding_date'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">Fecha de la Boda (ISO):</label>
            <input type="datetime-local" value={weddingDate.slice(0, 16)} onChange={(e) => setWeddingDate(e.target.value + ':00')} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
          </div>
        </section>

        {/* 2. DRESS CODE Y PALETA HEXADECIMAL DE COLORES */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Shirt size={18} /> Código de Vestimenta</h3>
            <div className="flex gap-2">
              <button onClick={() => setActivePreviewModal('dress')} className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs flex items-center gap-1 border border-white/10">
                <Eye size={14} /> Previsualizar
              </button>
              <button onClick={() => saveConfigSection('dress_code', dressCode)} disabled={savingKey === 'dress_code'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Título:</label>
              <input type="text" value={dressCode.title} onChange={(e) => setDressCode({ ...dressCode, title: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Nota Prohibición:</label>
              <input type="text" value={dressCode.note} onChange={(e) => setDressCode({ ...dressCode, note: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
          </div>

          {/* PALETA DE CÍRCULOS MEDIANTE TEXTO HEX */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-neutral-400">Tarjetas de Colores (Muestra HEX):</label>
              <button onClick={() => setDressCode({ ...dressCode, colors: [...dressCode.colors, '#000000'] })} className="px-3 py-1 bg-neutral-900 border border-white/10 rounded-lg text-xs flex items-center gap-1 text-white">
                <Plus size={12} /> Añadir Color HEX
              </button>
            </div>

            <div className="grid gap-2">
              {dressCode.colors?.map((colorHex, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-black/60 p-3 rounded-xl border border-white/5">
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => moveColorItem(idx, 'up')} disabled={idx === 0} className="p-1 bg-neutral-900 disabled:opacity-20 rounded text-neutral-300"><ArrowUp size={12} /></button>
                    <button onClick={() => moveColorItem(idx, 'down')} disabled={idx === dressCode.colors.length - 1} className="p-1 bg-neutral-900 disabled:opacity-20 rounded text-neutral-300"><ArrowDown size={12} /></button>
                  </div>

                  <div className="w-8 h-8 rounded-full border border-white/20 shrink-0 shadow-inner" style={{ backgroundColor: colorHex }} />

                  <input 
                    type="text" 
                    placeholder="#HEX" 
                    value={colorHex} 
                    onChange={(e) => {
                      const colors = [...dressCode.colors];
                      colors[idx] = e.target.value;
                      setDressCode({ ...dressCode, colors });
                    }} 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-amber-400 tracking-widest uppercase" 
                  />

                  <button onClick={() => { const colors = dressCode.colors.filter((_, i) => i !== idx); setDressCode({ ...dressCode, colors }); }} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. RECEPCIÓN Y UBICACIÓN */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><MapPin size={18} /> Recepción y Ubicación</h3>
            <button onClick={() => saveConfigSection('venue_info', venueInfo)} disabled={savingKey === 'venue_info'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> Guardar
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Nombre Salón/Lugar:</label>
              <input type="text" value={venueInfo.name} onChange={(e) => setVenueInfo({ ...venueInfo, name: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Ubicación / Ciudad:</label>
              <input type="text" value={venueInfo.location} onChange={(e) => setVenueInfo({ ...venueInfo, location: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">Enlace Google Maps:</label>
            <input type="text" value={venueInfo.maps_url} onChange={(e) => setVenueInfo({ ...venueInfo, maps_url: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
          </div>
        </section>

        {/* 4. MESA DE REGALOS (DATOS BANCARIOS Y LINKS REORDENABLES) */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Gift size={18} /> Mesa de Regalos</h3>
            <div className="flex gap-2">
              <button onClick={() => setActivePreviewModal('gift')} className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs flex items-center gap-1 border border-white/10">
                <Eye size={14} /> Previsualizar
              </button>
              <button onClick={() => saveConfigSection('gift_registry', giftRegistry)} disabled={savingKey === 'gift_registry'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono text-amber-500 uppercase tracking-wider">1. Transferencia Bancaria Directa</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1">Banco:</label>
                <input type="text" placeholder="Ej. BBVA" value={giftRegistry.bank.bank_name} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, bank_name: e.target.value } })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1">Titular:</label>
                <input type="text" placeholder="Nombre completo" value={giftRegistry.bank.holder} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, holder: e.target.value } })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1">CLABE (18 dígitos):</label>
                <input type="text" placeholder="0121..." value={giftRegistry.bank.clabe} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, clabe: e.target.value } })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-amber-400 font-mono" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono text-amber-500 uppercase tracking-wider">2. Listas de Deseos Externa (Tiendas)</h4>
              <button onClick={() => setGiftRegistry({ ...giftRegistry, links: [...giftRegistry.links, { name: '', url: '' }] })} className="px-3 py-1.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-xs flex items-center gap-1 text-white">
                <Plus size={14} /> Añadir Tienda
              </button>
            </div>

            <div className="space-y-3">
              {giftRegistry.links.map((link, i) => (
                <div key={i} className="flex gap-2 items-center bg-black/60 p-3 rounded-xl border border-white/5">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => moveLinkItem(i, 'up')} disabled={i === 0} className="p-1 bg-neutral-900 disabled:opacity-20 rounded text-neutral-300"><ArrowUp size={12} /></button>
                    <button onClick={() => moveLinkItem(i, 'down')} disabled={i === giftRegistry.links.length - 1} className="p-1 bg-neutral-900 disabled:opacity-20 rounded text-neutral-300"><ArrowDown size={12} /></button>
                  </div>
                  <input type="text" placeholder="Nombre (Ej. Amazon, Liverpool)" value={link.name} onChange={(e) => { const links = [...giftRegistry.links]; links[i].name = e.target.value; setGiftRegistry({ ...giftRegistry, links }); }} className="w-1/3 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white" />
                  <input type="text" placeholder="URL (https://...)" value={link.url} onChange={(e) => { const links = [...giftRegistry.links]; links[i].url = e.target.value; setGiftRegistry({ ...giftRegistry, links }); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300" />
                  <button onClick={() => { const links = giftRegistry.links.filter((_, idx) => idx !== i); setGiftRegistry({ ...giftRegistry, links }); }} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. ITINERARIO TARJETAS MOVILES */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Clock size={18} /> Itinerario (Tarjetas Móviles)</h3>
            <div className="flex gap-2">
              <button onClick={() => setActivePreviewModal('itinerary')} className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs flex items-center gap-1 border border-white/10">
                <Eye size={14} /> Previsualizar
              </button>
              <button onClick={() => setItinerary([...itinerary, { time: '20:00', title: 'Nuevo Evento', desc: 'Descripción' }])} className="px-3 py-1.5 bg-neutral-900 border border-white/10 text-white rounded-xl text-xs flex items-center gap-1">
                <Plus size={14} /> Evento
              </button>
              <button onClick={() => saveConfigSection('itinerary', itinerary)} disabled={savingKey === 'itinerary'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {itinerary.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-3 p-4 bg-black/60 rounded-2xl border border-white/5 items-center shadow-lg">
                <div className="flex md:flex-col gap-1 shrink-0">
                  <button onClick={() => moveItineraryItem(i, 'up')} disabled={i === 0} className="p-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-20 rounded text-neutral-300"><ArrowUp size={14} /></button>
                  <button onClick={() => moveItineraryItem(i, 'down')} disabled={i === itinerary.length - 1} className="p-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-20 rounded text-neutral-300"><ArrowDown size={14} /></button>
                </div>
                <input type="text" placeholder="18:00" value={item.time} onChange={(e) => { const it = [...itinerary]; it[i].time = e.target.value; setItinerary(it); }} className="w-full md:w-28 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono" />
                <input type="text" placeholder="Título" value={item.title} onChange={(e) => { const it = [...itinerary]; it[i].title = e.target.value; setItinerary(it); }} className="w-full md:w-48 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-serif font-bold" />
                <input type="text" placeholder="Descripción" value={item.desc} onChange={(e) => { const it = [...itinerary]; it[i].desc = e.target.value; setItinerary(it); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300" />
                <button onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL DE PREVISUALIZACIÓN EN TIEMPO REAL REALISTA */}
      {activePreviewModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-serif text-amber-400">Previsualización Exacta</h3>
              <button onClick={() => setActivePreviewModal(null)} className="p-2 text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-4 bg-black rounded-2xl border border-white/5">
              {activePreviewModal === 'date' && (
                <div className="text-center space-y-4 p-6">
                  <h4 className="text-amber-500 font-mono text-xs uppercase tracking-widest">El Gran Día</h4>
                  <p className="text-3xl font-serif text-white">{new Date(weddingDate).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })}</p>
                </div>
              )}

              {activePreviewModal === 'dress' && (
                <DressCode config={dressCode} />
              )}

              {activePreviewModal === 'itinerary' && (
                <Timeline events={itinerary} />
              )}

              {activePreviewModal === 'gift' && (
                <div className="max-w-md mx-auto h-[400px]">
                  <GiftRegistry config={giftRegistry} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}