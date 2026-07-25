'use client';
import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Calendar, MapPin, Gift, Clock, ShieldCheck, Shirt } from 'lucide-react';

export default function AdminConfiguracion() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const [weddingDate, setWeddingDate] = useState('2026-12-31T20:00:00');
  const [venueInfo, setVenueInfo] = useState({ name: '', location: '', maps_url: '' });
  const [dressCode, setDressCode] = useState({ title: '', note: '' });
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
      if (data.success) alert('Sección guardada correctamente.');
      else alert('Error al guardar.');
    } catch {
      alert('Error de conexión.');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center text-amber-500 font-mono">Cargando configuración...</div>;

  return (
    <div className="h-full bg-black text-white p-4 md:p-10 overflow-y-auto selection:bg-amber-500 selection:text-black">
      <div className="max-w-4xl mx-auto pb-24 space-y-10">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">Configuración del Sitio</h1>
            <p className="text-neutral-500 text-xs mt-1 font-mono">Administra textos, fechas, itinerario y mesa de regalos.</p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Control Panel</span>
          </div>
        </div>

        {/* 1. FECHA DE BODA */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Calendar size={18} /> Fecha y Hora del Evento</h3>
            <button onClick={() => saveConfigSection('wedding_date', weddingDate)} disabled={savingKey === 'wedding_date'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> {savingKey === 'wedding_date' ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">Fecha ISO (Año-Mes-DíaTHora:Min:Seg):</label>
            <input type="datetime-local" value={weddingDate.slice(0, 16)} onChange={(e) => setWeddingDate(e.target.value + ':00')} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
          </div>
        </section>

        {/* 2. RECEPCIÓN Y UBICACIÓN */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><MapPin size={18} /> Recepción y Ubicación</h3>
            <button onClick={() => saveConfigSection('venue_info', venueInfo)} disabled={savingKey === 'venue_info'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> {savingKey === 'venue_info' ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Nombre del Salón / Hacienda:</label>
              <input type="text" value={venueInfo.name} onChange={(e) => setVenueInfo({ ...venueInfo, name: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Ciudad / Estado:</label>
              <input type="text" value={venueInfo.location} onChange={(e) => setVenueInfo({ ...venueInfo, location: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">Enlace a Google Maps:</label>
            <input type="text" value={venueInfo.maps_url} onChange={(e) => setVenueInfo({ ...venueInfo, maps_url: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
          </div>
        </section>

        {/* 3. DRESS CODE */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Shirt size={18} /> Código de Vestimenta</h3>
            <button onClick={() => saveConfigSection('dress_code', dressCode)} disabled={savingKey === 'dress_code'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> {savingKey === 'dress_code' ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Título (Ej. Etiqueta Rigurosa):</label>
              <input type="text" value={dressCode.title} onChange={(e) => setDressCode({ ...dressCode, title: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Restricciones / Nota:</label>
              <input type="text" value={dressCode.note} onChange={(e) => setDressCode({ ...dressCode, note: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
          </div>
        </section>

        {/* 4. MESA DE REGALOS (DATOS Y LINKS DINÁMICOS) */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Gift size={18} /> Mesa de Regalos</h3>
            <button onClick={() => saveConfigSection('gift_registry', giftRegistry)} disabled={savingKey === 'gift_registry'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> {savingKey === 'gift_registry' ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Datos Bancarios (Transferencia)</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <input type="text" placeholder="Banco (Ej. BBVA)" value={giftRegistry.bank.bank_name} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, bank_name: e.target.value } })} className="bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
              <input type="text" placeholder="Titular de la Cuenta" value={giftRegistry.bank.holder} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, holder: e.target.value } })} className="bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
              <input type="text" placeholder="CLABE Interbancaria (18 dígitos)" value={giftRegistry.bank.clabe} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, clabe: e.target.value } })} className="bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Listas de Deseos (Tiendas)</h4>
              <button onClick={() => setGiftRegistry({ ...giftRegistry, links: [...giftRegistry.links, { name: '', url: '' }] })} className="px-3 py-1.5 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg text-xs flex items-center gap-1 text-white">
                <Plus size={14} /> Agregar Tienda
              </button>
            </div>
            {giftRegistry.links.map((link, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input type="text" placeholder="Nombre (Ej. Amazon, Liverpool)" value={link.name} onChange={(e) => { const links = [...giftRegistry.links]; links[i].name = e.target.value; setGiftRegistry({ ...giftRegistry, links }); }} className="w-1/3 bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
                <input type="text" placeholder="Enlace URL (https://...)" value={link.url} onChange={(e) => { const links = [...giftRegistry.links]; links[i].url = e.target.value; setGiftRegistry({ ...giftRegistry, links }); }} className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white" />
                <button onClick={() => { const links = giftRegistry.links.filter((_, idx) => idx !== i); setGiftRegistry({ ...giftRegistry, links }); }} className="p-3 text-neutral-500 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* 5. ITINERARIO DINÁMICO */}
        <section className="bg-neutral-950 p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Clock size={18} /> Itinerario</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setItinerary([...itinerary, { time: '', title: '', desc: '' }])} className="px-3 py-2 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-xl text-xs flex items-center gap-1 text-white">
                <Plus size={14} /> Evento
              </button>
              <button onClick={() => saveConfigSection('itinerary', itinerary)} disabled={savingKey === 'itinerary'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Save size={14} /> {savingKey === 'itinerary' ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {itinerary.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-3 p-4 bg-black/60 rounded-xl border border-white/5 items-center">
                <input type="text" placeholder="Hora (18:00)" value={item.time} onChange={(e) => { const it = [...itinerary]; it[i].time = e.target.value; setItinerary(it); }} className="w-full md:w-28 bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white" />
                <input type="text" placeholder="Título (Ceremonia)" value={item.title} onChange={(e) => { const it = [...itinerary]; it[i].title = e.target.value; setItinerary(it); }} className="w-full md:w-48 bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white" />
                <input type="text" placeholder="Ubicación / Detalles" value={item.desc} onChange={(e) => { const it = [...itinerary]; it[i].desc = e.target.value; setItinerary(it); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white" />
                <button onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}