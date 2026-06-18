'use client';
import { motion } from 'framer-motion';

export default function SeatingMap({ tableName }: { tableName: string }) {
  // Extraer el dígito numérico para mostrarlo en el centro del diseño circular
  const tableNumber = tableName.replace(/[^\d]/g, '') || '•';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-4 bg-black/40 rounded-2xl p-6 border border-white/5 relative overflow-hidden text-center"
    >
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <h4 className="text-amber-500 text-[9px] font-bold font-mono tracking-[0.2em] uppercase mb-4">Ubicación Asignada</h4>
      
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Renderizado estructural del objeto mesa */}
        <div className="relative flex items-center justify-center w-28 h-24">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-24 h-24 border border-dashed border-amber-500/30 rounded-full"
          />
          <div className="w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-950 rounded-full flex items-center justify-center shadow-2xl border border-white/10 relative z-10">
            <span className="text-white font-serif text-2xl font-bold">{tableNumber}</span>
          </div>
          
          {/* Asientos de referencia periférica */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-neutral-700 rounded-full border border-black"
              style={{ transform: `rotate(${deg}deg) translateY(-44px)` }}
            />
          ))}
        </div>
        
        <p className="text-white font-serif text-xl tracking-wide">{tableName}</p>
      </div>
    </motion.div>
  );
}