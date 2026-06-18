export default function DressCode() {
  return (
    <div className="bg-neutral-900/50 backdrop-blur-sm p-10 md:p-14 rounded-[2rem] border border-white/10 text-center max-w-3xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <h3 className="text-amber-500 tracking-[0.4em] uppercase text-xs font-bold mb-4">Dress Code</h3>
      <h2 className="text-4xl md:text-5xl font-serif mb-8 text-white">Etiqueta Rigurosa</h2>
      
      <div className="flex justify-center gap-4 md:gap-8 mb-10">
        <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border-2 border-white/20 shadow-inner"></div>
        <div className="w-16 h-16 rounded-full bg-[#1e293b] border-2 border-white/20 shadow-inner"></div>
        <div className="w-16 h-16 rounded-full bg-[#064e3b] border-2 border-white/20 shadow-inner"></div>
        <div className="w-16 h-16 rounded-full bg-[#4c0519] border-2 border-white/20 shadow-inner"></div>
      </div>
      
      <div className="inline-block bg-red-950/30 border border-red-500/20 px-6 py-3 rounded-xl">
        <p className="text-sm text-red-400 font-bold uppercase tracking-widest">
          Estrictamente prohibido color blanco o derivados.
        </p>
      </div>
    </div>
  );
}