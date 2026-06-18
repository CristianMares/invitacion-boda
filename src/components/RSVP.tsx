'use client';
import { useState } from 'react';
import { Send, CheckCircle2, User, Phone, Users, ArrowRight, ArrowLeft, Info } from 'lucide-react';

export default function RSVP() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    ticketsRequested: 1
  });

  const [companions, setCompanions] = useState(
    Array.from({ length: 5 }, () => ({ fullName: '', description: '' }))
  );

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ticketsRequested > 1) {
      setStep(2);
    } else {
      submitData();
    }
  };

  const submitData = async () => {
    setStatus('loading');
    const validCompanions = companions.slice(0, formData.ticketsRequested - 1);
    
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, companions: validCompanions }),
      });
      
      const data = await res.json();
      if (data.success) setStatus('success');
      else setStatus('error');
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-8 bg-neutral-900/80 backdrop-blur-md p-8 rounded-2xl border border-emerald-500/30 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle2 size={56} className="text-emerald-400 mx-auto mb-6" />
        <h3 className="text-2xl font-serif text-white mb-2">Solicitud Recibida</h3>
        <p className="text-neutral-400 mb-6 text-sm">Registro completado para {formData.ticketsRequested} pase(s).</p>
        <div className="bg-emerald-950/50 p-4 rounded-xl border border-emerald-500/20 text-left">
          <div className="flex gap-3 items-start">
            <Info size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-100/80">
              En Octubre te enviaremos un mensaje por WhatsApp al <strong>{formData.phone}</strong> para entregarte los códigos QR de acceso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-neutral-900/60 p-6 sm:p-8 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl">
      {/* Indicador de Pasos */}
      {formData.ticketsRequested > 1 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-amber-500' : 'bg-neutral-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-amber-500' : 'bg-neutral-800'}`} />
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleNextStep} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-left mb-2">
            <h3 className="text-white font-serif text-xl">Datos del Titular</h3>
            <p className="text-neutral-500 text-sm">Quien recibirá los pases por WhatsApp.</p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={18} className="text-neutral-500" />
            </div>
            <input 
              type="text" 
              placeholder="Nombre Completo" 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/50 border border-neutral-800 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-neutral-600"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone size={18} className="text-neutral-500" />
            </div>
            <input 
              type="tel" 
              placeholder="Número de WhatsApp" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/50 border border-neutral-800 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-neutral-600"
              required
              minLength={10}
              maxLength={15}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users size={18} className="text-neutral-500" />
            </div>
            <select 
              value={formData.ticketsRequested}
              onChange={(e) => setFormData({...formData, ticketsRequested: Number(e.target.value)})}
              className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/50 border border-neutral-800 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num} className="bg-neutral-900">
                  {num} {num === 1 ? 'Pase en total' : 'Pases en total'}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="mt-4 bg-white text-black hover:bg-neutral-200 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            {formData.ticketsRequested > 1 ? <>Siguiente <ArrowRight size={18} /></> : <>Enviar Solicitud <Send size={18} /></>}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); submitData(); }} className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4">
          <div className="text-left mb-2 flex items-center gap-4">
            <button type="button" onClick={() => setStep(1)} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 text-white">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h3 className="text-white font-serif text-xl">Acompañantes</h3>
              <p className="text-neutral-500 text-sm">Detalla tus {formData.ticketsRequested - 1} pases extra.</p>
            </div>
          </div>

          <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-neutral-700">
            {Array.from({ length: formData.ticketsRequested - 1 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 bg-black/30 rounded-xl border border-neutral-800/50">
                <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">Pase {i + 2}</p>
                <input 
                  type="text" 
                  placeholder="Nombre de la persona" 
                  value={companions[i].fullName}
                  onChange={(e) => {
                    const newComps = [...companions];
                    newComps[i].fullName = e.target.value;
                    setCompanions(newComps);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neutral-800 text-white focus:border-amber-500 outline-none text-sm"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Descripción (Ej. Esposa, Amigo)" 
                  value={companions[i].description}
                  onChange={(e) => {
                    const newComps = [...companions];
                    newComps[i].description = e.target.value;
                    setCompanions(newComps);
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-neutral-800 text-white focus:border-amber-500 outline-none text-sm"
                />
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {status === 'loading' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Confirmar Registro <Send size={18} /></>}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="mt-4 text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/30 animate-in fade-in">
          Error de conexión. Intenta nuevamente.
        </p>
      )}
    </div>
  );
}