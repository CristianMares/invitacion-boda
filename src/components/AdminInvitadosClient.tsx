'use client';
import { useState } from 'react';
import { Check, X, Phone, Users, Clock, ShieldCheck, Search, MessageCircle, Send, RefreshCw } from 'lucide-react';

export default function AdminInvitadosClient({ initialGuests, heroInitials, waTemplate }: any) {
  const [guests, setGuests] = useState(initialGuests);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [overridePhones, setOverridePhones] = useState<Record<string, string>>({});

  const filterBySearch = (list: any[]) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(g => 
      g.full_name.toLowerCase().includes(term) ||
      g.phone.includes(term) ||
      g.companions.some((c: any) => c.name.toLowerCase().includes(term))
    );
  };

  // Contadores dinámicos que reaccionan a la búsqueda
  const pendingList = filterBySearch(guests.filter((g: any) => g.status === 'pending'));
  const approvedList = filterBySearch(guests.filter((g: any) => g.status === 'approved' && !g.has_entered));
  const enteredList = filterBySearch(guests.filter((g: any) => g.has_entered));
  const rejectedList = filterBySearch(guests.filter((g: any) => g.status === 'rejected'));

  const counts = {
    pending: pendingList.length,
    approved: approvedList.length,
    entered: enteredList.length,
    rejected: rejectedList.length,
  };

  const getActiveList = () => {
    if (activeTab === 'pending') return pendingList;
    if (activeTab === 'approved') return approvedList;
    if (activeTab === 'entered') return enteredList;
    if (activeTab === 'rejected') return rejectedList;
    return [];
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
    await fetch('/api/admin/guests/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: id, status: newStatus })
    });
  };

  const markWhatsAppSent = async (id: string, phoneToUse: string) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, sent_wa: true } : g));
    
    // Abrir WhatsApp con el número ingresado o por defecto
    const ticketUrl = `https://invitacion-boda-bbmh.vercel.app/ticket/${id}`;
    const targetGuest = guests.find(g => g.id === id);
    const message = waTemplate
      .replace('{nombre}', targetGuest?.full_name || '')
      .replace('{iniciales}', heroInitials)
      .replace('{link}', ticketUrl);

    const waUrl = `https://wa.me/521${phoneToUse}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    await fetch('/api/admin/guests/wa-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId: id, sent: true })
    });
  };

  return (
    <div className="h-full bg-black text-white p-4 md:p-10 font-sans overflow-y-auto selection:bg-amber-500 selection:text-black">
      <div className="max-w-5xl mx-auto pb-24 space-y-8">
        
        {/* ENCABEZADO */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6 pt-12 md:pt-0">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-wide">Validación de Registros</h1>
            <p className="text-neutral-500 text-xs mt-1 font-mono">Control de admisión y reenvío de pases</p>
          </div>
          <div className="bg-neutral-900 px-4 py-2 rounded-full border border-white/5 hidden sm:flex items-center gap-2">
            <ShieldCheck className="text-amber-500" size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Control Panel</span>
          </div>
        </div>

        {/* BUSCADOR INSTANTÁNEO MULTI-CAMPO */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Buscar por Titular, Acompañante o Teléfono..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-neutral-900/80 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-amber-500 outline-none font-mono"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white">
              Limpiar
            </button>
          )}
        </div>

        {/* PESTAÑAS CON PARPADEO SI HAY COINCIDENCIAS DE BÚSQUEDA */}
        <div className="flex border-b border-white/5 gap-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('pending')} 
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${
              activeTab === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-transparent text-neutral-500 border-transparent'
            } ${searchTerm && counts.pending > 0 && activeTab !== 'pending' ? 'animate-pulse text-amber-400 border-amber-500/50 bg-amber-500/20' : ''}`}
          >
            Pendientes ({counts.pending})
          </button>

          <button 
            onClick={() => setActiveTab('approved')} 
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${
              activeTab === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-transparent text-neutral-500 border-transparent'
            } ${searchTerm && counts.approved > 0 && activeTab !== 'approved' ? 'animate-pulse text-amber-400 border-amber-500/50 bg-amber-500/20' : ''}`}
          >
            Aprobados ({counts.approved})
          </button>

          <button 
            onClick={() => setActiveTab('entered')} 
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${
              activeTab === 'entered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-transparent text-neutral-500 border-transparent'
            } ${searchTerm && counts.entered > 0 && activeTab !== 'entered' ? 'animate-pulse text-amber-400 border-amber-500/50 bg-amber-500/20' : ''}`}
          >
            En Salón ({counts.entered})
          </button>

          <button 
            onClick={() => setActiveTab('rejected')} 
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-t-xl transition-all border-t border-x ${
              activeTab === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-transparent text-neutral-500 border-transparent'
            } ${searchTerm && counts.rejected > 0 && activeTab !== 'rejected' ? 'animate-pulse text-amber-400 border-amber-500/50 bg-amber-500/20' : ''}`}
          >
            Rechazados ({counts.rejected})
          </button>
        </div>

        {/* LISTADO FILTRADO */}
        <div className="grid gap-4">
          {getActiveList().length === 0 && (
            <div className="text-center py-16 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
              <p className="text-neutral-500 text-xs font-mono">Sin registros que coincidan con los filtros.</p>
            </div>
          )}

          {getActiveList().map((guest: any) => {
            const currentOverridePhone = overridePhones[guest.id] || guest.phone;

            return (
              <div key={guest.id} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-md hover:border-white/10 transition-colors">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-serif text-white">{guest.full_name}</h3>
                      {guest.sent_wa && (
                        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">✓ WA Enviado</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-neutral-400 font-mono">
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-neutral-600" /> {guest.phone}</div>
                      <div className="flex items-center gap-1.5"><Users size={12} className="text-neutral-600" /> {guest.tickets_requested} pases</div>
                      <div className="flex items-center gap-1.5"><Clock size={12} className="text-neutral-600" /> {new Date(guest.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* ACCIONES POR PESTAÑA */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {activeTab === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(guest.id, 'rejected')} className="p-3 bg-neutral-900 hover:bg-red-950/30 text-neutral-500 hover:text-red-400 rounded-xl transition-all border border-white/5">
                          <X size={16} />
                        </button>
                        <button onClick={() => updateStatus(guest.id, 'approved')} className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md">
                          <Check size={16} /> Aprobar Access
                        </button>
                      </>
                    )}

                    {activeTab === 'approved' && (
                      <>
                        <button onClick={() => markWhatsAppSent(guest.id, currentOverridePhone)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md">
                          <MessageCircle size={14} /> {guest.sent_wa ? 'Reenviar WA' : 'Enviar WA'}
                        </button>
                        <button onClick={() => updateStatus(guest.id, 'rejected')} className="flex items-center gap-2 bg-neutral-900 border border-red-500/20 hover:bg-red-950/40 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                          <X size={14} /> Revocar
                        </button>
                      </>
                    )}

                    {activeTab === 'entered' && (
                      <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 text-xs font-mono font-bold">
                        ✓ Ingresó al Salón
                      </div>
                    )}

                    {activeTab === 'rejected' && (
                      <button onClick={() => updateStatus(guest.id, 'approved')} className="flex items-center gap-2 bg-neutral-900 border border-emerald-500/20 hover:bg-emerald-950/40 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                        <Check size={14} /> Re-Aprobar
                      </button>
                    )}
                  </div>
                </div>

                {/* ACOMPAÑANTES */}
                {guest.companions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5 border-t border-white/5">
                    {guest.companions.map((c: any, i: number) => (
                      <span key={i} className="text-[10px] font-mono bg-black px-2.5 py-1 rounded-lg border border-white/5 text-neutral-400" title={c.desc}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* OPCIÓN DE REENVÍO A OTRO NÚMERO TELEFÓNICO */}
                {activeTab === 'approved' && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-500">¿Enviar a otro teléfono?:</span>
                    <input 
                      type="tel" 
                      placeholder="Nuevo teléfono (10 dígitos)" 
                      value={overridePhones[guest.id] || ''} 
                      onChange={(e) => setOverridePhones({ ...overridePhones, [guest.id]: e.target.value.replace(/\D/g, '') })} 
                      className="bg-black border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono text-amber-400 w-44" 
                    />
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