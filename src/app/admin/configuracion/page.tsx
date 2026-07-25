'use client';
import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Calendar, MapPin, Gift, Clock, ShieldCheck, Shirt, ArrowUp, ArrowDown, Eye, X, Type, MessageSquare, Send, AlertTriangle } from 'lucide-react';
import Countdown from '@/components/Countdown';
import CalendarButton from '@/components/CalendarButton';
import Timeline from '@/components/Timeline';
import DressCode from '@/components/DressCode';
import GiftRegistry from '@/components/GiftRegistry';

export default function AdminConfiguracion() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [activePreviewModal, setActivePreviewModal] = useState<string | null>(null);

  // Estados Editables
  const [heroInfo, setHeroInfo] = useState({ initials: '', subtitle: '', description: '' });
  const [weddingDate, setWeddingDate] = useState('');
  const [venueInfo, setVenueInfo] = useState({ name: '', location: '', maps_url: '' });
  const [dressCode, setDressCode] = useState({ title: '', note: '', colors: [] as string[] });
  const [giftRegistry, setGiftRegistry] = useState({
    bank: { bank_name: '', holder: '', clabe: '' },
    links: [] as Array<{ name: string, url: string }>
  });
  const [itinerary, setItinerary] = useState([] as Array<{ time: string, title: string, desc: string }>);
  const [whatsappInfo, setWhatsappInfo] = useState({
    template: '¡Hola {nombre}! Tu pase para la boda de {iniciales} está listo.\n\nCódigo de Consulta: {id}\n\nAccede a tu código QR y mesa asignada aquí:\n{link}'
  });
  const [testPhone, setTestPhone] = useState('');

  // Referencia de Datos Originales para Alertas de Cambios
  const originalConfigRef = useRef<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/admin/config').then(res => res.json()).then(data => {
      if (data.success && data.config) {
        originalConfigRef.current = data.config;
        if (data.config.hero_info) setHeroInfo(data.config.hero_info);
        if (data.config.wedding_date) setWeddingDate(data.config.wedding_date);
        if (data.config.venue_info) setVenueInfo(data.config.venue_info);
        if (data.config.dress_code) setDressCode(data.config.dress_code);
        if (data.config.gift_registry) setGiftRegistry(data.config.gift_registry);
        if (data.config.itinerary) setItinerary(data.config.itinerary);
        if (data.config.whatsapp_info) setWhatsappInfo(data.config.whatsapp_info);
      }
      setLoading(false);
    });
  }, []);

  // Comprobar si hay cambios no guardados
  const isSectionDirty = (key: string, currentValue: any) => {
    const originalValue = originalConfigRef.current[key];
    if (!originalValue) return false;
    return JSON.stringify(originalValue) !== JSON.stringify(currentValue);
  };

  const hasAnyDirtySection = 
    isSectionDirty('hero_info', heroInfo) ||
    isSectionDirty('wedding_date', weddingDate) ||
    isSectionDirty('venue_info', venueInfo) ||
    isSectionDirty('dress_code', dressCode) ||
    isSectionDirty('gift_registry', giftRegistry) ||
    isSectionDirty('itinerary', itinerary) ||
    isSectionDirty('whatsapp_info', whatsappInfo);

  // Advertir al usuario al intentar salir de la pestaña con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasAnyDirtySection) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios no guardados en el CMS. ¿Seguro que deseas salir?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasAnyDirtySection]);

  const saveConfigSection = async (key: string, value: any) => {
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      const data = await res.json();
      if (data.success) {
        originalConfigRef.current[key] = value;
        alert('Sección guardada en la base de datos.');
      } else {
        alert('Error al guardar.');
      }
    } catch {
      alert('Error de conexión al servidor.');
    } finally {
      setSavingKey(null);
    }
  };

  const moveItineraryItem = (index: number, direction: 'up' | 'down') => {
    const list = [...itinerary];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setItinerary(list);
  };

  const moveColorItem = (index: number, direction: 'up' | 'down') => {
    const list = [...dressCode.colors];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setDressCode({ ...dressCode, colors: list });
  };

  const moveLinkItem = (index: number, direction: 'up' | 'down') => {
    const list = [...giftRegistry.links];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setGiftRegistry({ ...giftRegistry, links: list });
  };

  const sendTestWhatsapp = () => {
    if (!testPhone) return alert('Ingresa un número de prueba (10 dígitos)');
    const sampleMsg = whatsappInfo.template
      .replace('{nombre}', 'Invitado Prueba')
      .replace('{iniciales}', heroInfo.initials || 'M & X')
      .replace('{id}', 'demo-uuid-1234')
      .replace('{link}', 'https://invitacion-boda-bbmh.vercel.app/ticket/demo');

    const url = `https://wa.me/521${testPhone}?text=${encodeURIComponent(sampleMsg)}`;
    window.open(url, '_blank');
  };

  const dateObj = new Date(weddingDate);
  const formattedDateText = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const capitalizedDateText = formattedDateText
    ? formattedDateText.charAt(0).toUpperCase() + formattedDateText.slice(1)
    : '';

  if (loading) return <div className="h-full flex items-center justify-center text-amber-500 font-mono">Cargando CMS...</div>;

  return (
    <div className="h-full bg-black text-white p-4 md:p-10 overflow-y-auto selection:bg-amber-500 selection:text-black">
      <div className="max-w-4xl mx-auto pb-24 space-y-10">
        
        {/* HEADER CON ALERTA GLOBAL SI HAY CAMBIOS SUCIOS */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif text-white tracking-wide">Configuración del Sitio</h1>
              {hasAnyDirtySection && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle size={12} /> Hay Cambios Sin Guardar
                </span>
              )}
            </div>
            <p className="text-neutral-500 text-xs mt-1 font-mono">Gestión dinámica de textos, fechas, itinerario, regalos y mensajes.</p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Protección SSL</span>
          </div>
        </div>

        {/* 1. MONOGRAMA Y ENCABEZADO */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-4 ${
          isSectionDirty('hero_info', heroInfo) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Type size={18} /> Monograma y Encabezado</h3>
              {isSectionDirty('hero_info', heroInfo) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActivePreviewModal('hero')} className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs flex items-center gap-1 border border-white/10">
                <Eye size={14} /> Previsualizar
              </button>
              <button onClick={() => saveConfigSection('hero_info', heroInfo)} disabled={savingKey === 'hero_info'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
                <Save size={14} /> Guardar
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Iniciales Pareja:</label>
              <input type="text" value={heroInfo.initials} onChange={(e) => setHeroInfo({ ...heroInfo, initials: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Subtítulo:</label>
              <input type="text" value={heroInfo.subtitle} onChange={(e) => setHeroInfo({ ...heroInfo, subtitle: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">Mensaje de Bienvenida:</label>
            <input type="text" value={heroInfo.description} onChange={(e) => setHeroInfo({ ...heroInfo, description: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
          </div>
        </section>

        {/* 2. PLANTILLA WHATSAPP */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-4 ${
          isSectionDirty('whatsapp_info', whatsappInfo) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><MessageSquare size={18} /> Plantilla de Mensaje WhatsApp</h3>
              {isSectionDirty('whatsapp_info', whatsappInfo) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
            <button onClick={() => saveConfigSection('whatsapp_info', whatsappInfo)} disabled={savingKey === 'whatsapp_info'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> Guardar
            </button>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">
              Plantilla (Variables: <code className="text-amber-400">{'{nombre}'}</code>, <code className="text-amber-400">{'{iniciales}'}</code>, <code className="text-amber-400">{'{id}'}</code>, <code className="text-amber-400">{'{link}'}</code>):
            </label>
            <textarea 
              rows={4} 
              value={whatsappInfo.template} 
              onChange={(e) => setWhatsappInfo({ template: e.target.value })} 
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-amber-200 font-mono focus:border-amber-500 outline-none" 
            />
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-col md:flex-row gap-3 items-center">
            <input 
              type="tel" 
              placeholder="Teléfono de prueba (10 dígitos)" 
              value={testPhone} 
              onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))} 
              className="w-full md:w-64 bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500" 
            />
            <button 
              onClick={sendTestWhatsapp} 
              className="w-full md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Send size={14} /> Probar Mensaje en WhatsApp
            </button>
          </div>
        </section>

        {/* 3. FECHA Y CUENTA REGRESIVA */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-4 ${
          isSectionDirty('wedding_date', weddingDate) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Calendar size={18} /> Fecha y Cuenta Regresiva</h3>
              {isSectionDirty('wedding_date', weddingDate) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
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
            <label className="text-xs font-mono text-neutral-400 block mb-1">Fecha ISO Boda:</label>
            <input type="datetime-local" value={weddingDate ? weddingDate.slice(0, 16) : ''} onChange={(e) => setWeddingDate(e.target.value + ':00')} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
          </div>
        </section>

        {/* 4. DRESS CODE */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-4 ${
          isSectionDirty('dress_code', dressCode) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Shirt size={18} /> Código de Vestimenta</h3>
              {isSectionDirty('dress_code', dressCode) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
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
              <input type="text" value={dressCode.title} onChange={(e) => setDressCode({ ...dressCode, title: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Nota Prohibición:</label>
              <input type="text" value={dressCode.note} onChange={(e) => setDressCode({ ...dressCode, note: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono text-neutral-400">Tarjetas de Colores (HEX directo):</label>
              <button onClick={() => setDressCode({ ...dressCode, colors: [...dressCode.colors, '#000000'] })} className="px-3 py-1 bg-neutral-900 border border-white/10 rounded-lg text-xs flex items-center gap-1 text-white">
                <Plus size={12} /> Color
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
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-amber-400 tracking-widest uppercase outline-none focus:border-amber-500" 
                  />

                  <button onClick={() => { const colors = dressCode.colors.filter((_, i) => i !== idx); setDressCode({ ...dressCode, colors }); }} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. RECEPCIÓN Y UBICACIÓN */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-4 ${
          isSectionDirty('venue_info', venueInfo) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><MapPin size={18} /> Recepción y Ubicación</h3>
              {isSectionDirty('venue_info', venueInfo) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
            <button onClick={() => saveConfigSection('venue_info', venueInfo)} disabled={savingKey === 'venue_info'} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5">
              <Save size={14} /> Guardar
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Nombre Salón/Lugar:</label>
              <input type="text" value={venueInfo.name} onChange={(e) => setVenueInfo({ ...venueInfo, name: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-neutral-400 block mb-1">Ubicación / Ciudad:</label>
              <input type="text" value={venueInfo.location} onChange={(e) => setVenueInfo({ ...venueInfo, location: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1">Enlace Google Maps:</label>
            <input type="text" value={venueInfo.maps_url} onChange={(e) => setVenueInfo({ ...venueInfo, maps_url: e.target.value })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none" />
          </div>
        </section>

        {/* 6. MESA DE REGALOS */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-6 ${
          isSectionDirty('gift_registry', giftRegistry) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Gift size={18} /> Mesa de Regalos</h3>
              {isSectionDirty('gift_registry', giftRegistry) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
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
            <h4 className="text-xs font-mono text-amber-500 uppercase tracking-wider">Transferencia Bancaria</h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1">Banco:</label>
                <input type="text" placeholder="BBVA" value={giftRegistry.bank.bank_name} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, bank_name: e.target.value } })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1">Titular:</label>
                <input type="text" placeholder="Nombre completo" value={giftRegistry.bank.holder} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, holder: e.target.value } })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-500 block mb-1">CLABE (18 dígitos):</label>
                <input type="text" placeholder="0121..." value={giftRegistry.bank.clabe} onChange={(e) => setGiftRegistry({ ...giftRegistry, bank: { ...giftRegistry.bank, clabe: e.target.value } })} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-amber-400 font-mono focus:border-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono text-amber-500 uppercase tracking-wider">Listas de Deseos Externa (Tiendas)</h4>
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
                  <input type="text" placeholder="Nombre (Amazon, Liverpool)" value={link.name} onChange={(e) => { const links = [...giftRegistry.links]; links[i].name = e.target.value; setGiftRegistry({ ...giftRegistry, links }); }} className="w-1/3 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 outline-none" />
                  <input type="text" placeholder="URL (https://...)" value={link.url} onChange={(e) => { const links = [...giftRegistry.links]; links[i].url = e.target.value; setGiftRegistry({ ...giftRegistry, links }); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300 focus:border-amber-500 outline-none" />
                  <button onClick={() => { const links = giftRegistry.links.filter((_, idx) => idx !== i); setGiftRegistry({ ...giftRegistry, links }); }} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. ITINERARIO */}
        <section className={`p-6 rounded-2xl border transition-colors space-y-4 ${
          isSectionDirty('itinerary', itinerary) ? 'bg-amber-950/20 border-amber-500/50' : 'bg-neutral-950 border-white/10'
        }`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg text-amber-400 flex items-center gap-2"><Clock size={18} /> Itinerario (Tarjetas Móviles)</h3>
              {isSectionDirty('itinerary', itinerary) && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded font-bold animate-pulse">● Sin guardar</span>
              )}
            </div>
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
                <input type="text" placeholder="18:00" value={item.time} onChange={(e) => { const it = [...itinerary]; it[i].time = e.target.value; setItinerary(it); }} className="w-full md:w-28 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono outline-none focus:border-amber-500" />
                <input type="text" placeholder="Título" value={item.title} onChange={(e) => { const it = [...itinerary]; it[i].title = e.target.value; setItinerary(it); }} className="w-full md:w-48 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white font-serif font-bold outline-none focus:border-amber-500" />
                <input type="text" placeholder="Descripción" value={item.desc} onChange={(e) => { const it = [...itinerary]; it[i].desc = e.target.value; setItinerary(it); }} className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300 outline-none focus:border-amber-500" />
                <button onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* MODAL DE PREVISUALIZACIÓN VISTA REAL COMPLETA */}
      {activePreviewModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-neutral-950 border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-serif text-amber-400">Previsualización Exacta</h3>
              <button onClick={() => setActivePreviewModal(null)} className="p-2 text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-4 bg-black rounded-2xl border border-white/5">
              {activePreviewModal === 'hero' && (
                <div className="text-center space-y-4 p-8">
                  <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold font-mono">{heroInfo.subtitle}</h3>
                  <h1 className="text-5xl font-serif text-white">{heroInfo.initials}</h1>
                  <p className="text-neutral-400 italic text-sm">{heroInfo.description}</p>
                </div>
              )}

              {activePreviewModal === 'date' && (
                <div className="text-center space-y-6 p-4">
                  <h4 className="text-amber-500 font-mono text-xs uppercase tracking-widest">El Gran Día</h4>
                  {capitalizedDateText && (
                    <p className="text-amber-400 font-serif text-xl italic">
                      {capitalizedDateText}
                    </p>
                  )}
                  <Countdown targetDate={weddingDate} />
                  <CalendarButton weddingDate={weddingDate} title={`Boda de ${heroInfo.initials}`} location={`${venueInfo.name}, ${venueInfo.location}`} />
                </div>
              )}

              {activePreviewModal === 'dress' && (
                <DressCode config={dressCode} />
              )}

              {activePreviewModal === 'itinerary' && (
                <Timeline events={itinerary} />
              )}

              {activePreviewModal === 'gift' && (
                <div className="max-w-md mx-auto h-[380px]">
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