'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Ticket } from 'lucide-react';

export default function ConsultaPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/ticket/lookup?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success && data.guestId) {
        router.push(`/ticket/${data.guestId}`);
      } else {
        alert("No se encontró ningún pase asignado a este código o teléfono.");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900/80 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
          <Ticket size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Consulta tu Pase</h1>
          <p className="text-neutral-400 text-xs mt-2 font-mono">Ingresa tu número de WhatsApp o los 6 dígitos de tu código de acceso.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <input 
            type="text" 
            placeholder="Teléfono (10 dígitos) o Código" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            className="w-full bg-black border border-neutral-800 rounded-xl py-4 px-4 text-center text-lg text-white outline-none focus:border-amber-500 font-mono tracking-wider" 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-4 rounded-xl uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Buscando...' : <><Search size={16} /> Consultar Estado</>}
          </button>
        </form>
      </div>
    </div>
  );
}