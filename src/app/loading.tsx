export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-serif text-white tracking-widest uppercase text-sm">Cargando Boda...</h2>
    </div>
  );
}