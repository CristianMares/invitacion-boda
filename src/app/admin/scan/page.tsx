import { neon } from '@neondatabase/serverless';
import { CheckCircle2, XCircle, Users, AlertTriangle, ShieldX, PartyPopper } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string, success?: string }>;
}) {
  const { id, success } = await searchParams;

  if (success === 'true') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center selection:bg-amber-500">
        <div className="bg-neutral-900/50 p-10 rounded-[2rem] border border-emerald-500/30 max-w-md w-full backdrop-blur-md">
          <PartyPopper size={80} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="text-4xl font-serif text-white mb-2">Check-in Exitoso</h1>
          <p className="text-neutral-400 mb-8">Entrada registrada correctamente.</p>
          <a href="/admin/scan" className="bg-white text-black font-bold py-4 px-8 rounded-xl hover:bg-neutral-200 transition-colors inline-block w-full">
            Escanear Otro QR
          </a>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <XCircle size={64} className="text-neutral-700 mb-4" />
        <h1 className="text-2xl font-serif text-neutral-500">Esperando Código QR...</h1>
      </div>
    );
  }

  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  try {
    const rows = await sql`SELECT * FROM guests WHERE id = ${id}`;
    const guest = rows[0];

    if (!guest) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <XCircle size={64} className="text-red-500 mb-4" />
          <h1 className="text-3xl font-serif mb-2">Pase Inexistente</h1>
          <p className="text-neutral-400">El código no existe en la base de datos.</p>
        </div>
      );
    }

    if (guest.status !== 'confirmed' && guest.status !== 'approved') {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <ShieldX size={80} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-serif text-white mb-2">Acceso Denegado</h1>
          <p className="text-neutral-400 mb-6">Este pase no ha sido aprobado por los novios.</p>
        </div>
      );
    }

    if (guest.has_entered) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
          <div className="bg-neutral-900/80 p-8 rounded-3xl border border-red-500/30 text-center max-w-md w-full shadow-2xl backdrop-blur-md">
            <AlertTriangle size={80} className="text-amber-500 mx-auto mb-6" />
            <h1 className="text-3xl font-serif text-white mb-2">Pase Ya Usado</h1>
            <p className="text-neutral-400 mb-6">Alerta: Este código QR ya registró su entrada previamente.</p>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5">
              <h2 className="text-xl font-bold text-neutral-300">{guest.full_name}</h2>
            </div>
          </div>
        </div>
      );
    }

    async function markEntry() {
      'use server';
      const db = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
      await db`UPDATE guests SET has_entered = true WHERE id = ${id}`;
      redirect(`/admin/scan?id=${id}&success=true`);
    }

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="bg-neutral-900/80 p-8 rounded-[2rem] border border-emerald-500/30 text-center max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
          
          <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-6 relative z-10" />
          <h3 className="text-emerald-500 text-[10px] font-bold font-mono tracking-widest uppercase mb-2">Acceso Autorizado</h3>
          <h1 className="text-3xl font-serif text-white mb-6">{guest.full_name}</h1>
          
          <div className="bg-black/50 p-4 rounded-2xl flex items-center justify-center gap-4 mb-8 border border-white/5">
            <Users size={24} className="text-amber-500" />
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Pases Válidos</p>
              <p className="text-2xl font-mono font-bold text-white">{guest.tickets_requested}</p>
            </div>
          </div>

          <form action={markEntry}>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95">
              Registrar Entrada
            </button>
          </form>
        </div>
      </div>
    );
  } catch (error) {
    return <div className="text-white bg-black min-h-screen flex items-center justify-center">Error de conexión DB</div>;
  }
}