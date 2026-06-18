'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LayoutTemplate, QrCode, Image as ImageIcon, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  const menu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Aprobar Accesos', path: '/admin/invitados', icon: Users },
    { name: 'Diseñar Salón', path: '/admin/layout', icon: LayoutTemplate },
    { name: 'Asignar Mesas', path: '/admin/mesas', icon: Users },
    { name: 'Moderar Galería', path: '/admin/galeria', icon: ImageIcon },
    { name: 'Escáner QR', path: '/admin/scan', icon: QrCode },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Botón Móvil */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
      >
        <Menu size={24} />
      </button>

      {/* Overlay Móvil */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-neutral-950 border-r border-white/5 flex flex-col z-[70] shadow-2xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-amber-500 font-serif italic text-2xl">M & X</h2>
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">Admin OS</p>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-neutral-500 hover:text-white"><X size={20} /></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-all text-sm font-medium border border-transparent">
            <LogOut size={18} /> Salir a Pública
          </Link>
        </div>
      </aside>

      <main className="flex-1 h-full overflow-hidden bg-black relative">
        {children}
      </main>
    </div>
  );
}