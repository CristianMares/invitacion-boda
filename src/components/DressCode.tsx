'use client';
import { useState, useEffect } from 'react';

export default function DressCode() {
  const [config, setConfig] = useState({
    title: 'Etiqueta Rigurosa',
    note: 'Estrictamente prohibido color blanco o derivados.',
    colors: ['#0a0a0a', '#1e293b', '#064e3b', '#4c0519']
  });

  useEffect(() => {
    fetch('/api/admin/config').then(res => res.json()).then(data => {
      if (data.success && data.config?.dress_code) {
        setConfig(data.config.dress_code);
      }
    });
  }, []);

  return (
    <div className="bg-neutral-900/80 p-10 md:p-14 rounded-[2rem] border border-white/10 text-center max-w-3xl mx-auto relative overflow-hidden transform-gpu">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold mb-4 font-mono">Dress Code</h3>
      <h2 className="text-4xl md:text-5xl font-serif mb-8 text-white">{config.title}</h2>
      
      {config.colors && config.colors.length > 0 && (
        <div className="flex justify-center flex-wrap gap-4 md:gap-8 mb-10">
          {config.colors.map((hex, i) => (
            <div 
              key={i} 
              className="w-16 h-16 rounded-full border-2 border-white/20 shadow-2xl transition-transform hover:scale-110" 
              style={{ backgroundColor: hex }} 
            />
          ))}
        </div>
      )}
      
      <div className="inline-block bg-red-950/40 border border-red-500/30 px-6 py-3 rounded-xl">
        <p className="text-sm text-red-400 font-bold uppercase tracking-widest font-mono">
          {config.note}
        </p>
      </div>
    </div>
  );
}