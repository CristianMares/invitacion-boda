import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Lock, ShieldAlert } from 'lucide-react';

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function handleLogin(formData: FormData) {
    'use server';
    const pin = formData.get('pin') as string;
    const correctPin = process.env.ADMIN_PIN || '2026';

    if (pin === correctPin) {
      const cookieStore = await cookies();
      cookieStore.set('admin_auth', pin, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 día
      });
      redirect('/admin/invitados');
    } else {
      redirect('/admin/login?error=1');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <form action={handleLogin} className="w-full max-w-sm bg-neutral-900 border border-white/5 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-serif text-white">Acceso Restringido</h1>
          <p className="text-neutral-500 text-xs uppercase tracking-widest">Código PIN Requerido</p>
        </div>

        <div className="space-y-2">
          <input 
            type="password" 
            name="pin"
            placeholder="••••"
            maxLength={6}
            className="w-full text-center py-4 bg-black border border-neutral-800 rounded-xl text-xl text-white tracking-widest font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
            required
          />
        </div>

        <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all hover:bg-neutral-200 active:scale-95">
          Verificar Identidad
        </button>

        {error && (
          <div className="flex items-center gap-2 justify-center text-red-400 text-xs bg-red-950/30 border border-red-500/20 p-3 rounded-xl">
            <ShieldAlert size={14} />
            <span>Código PIN incorrecto.</span>
          </div>
        )}
      </form>
    </div>
  );
}
