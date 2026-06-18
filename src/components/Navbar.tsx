'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Camera, Image as ImageIcon, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Cámara Híbrida', href: '/camara', icon: Camera },
    { name: 'Galería de Fotos', href: '/galeria', icon: ImageIcon },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="fixed top-6 right-6 z-[100] bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-full text-white hover:bg-black/60 transition-all">
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-72 bg-neutral-950 border-l border-white/5 z-[120] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-amber-500 font-serif italic text-2xl">M & X</h2>
                <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white"><X size={24} /></button>
              </div>
              <nav className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-amber-500/10 text-neutral-300 hover:text-amber-400 transition-all group">
                    <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}