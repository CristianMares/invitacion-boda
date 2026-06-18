'use client';
import { useState, useRef, useEffect } from 'react';
import { Music, Pause, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.4;
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            console.error("Error al reproducir audio:", e);
            alert("No se pudo reproducir el audio. Verifica que el archivo exista en public/assets/song.mp3");
            setIsPlaying(false);
          });
      }
      setHasInteracted(true);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[90]">
      <audio ref={audioRef} src="/assets/song.mp3" loop preload="auto" />
      
      <div className="flex items-center gap-3">
        <button 
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md transition-all active:scale-95 ${
            isPlaying ? 'bg-amber-500 text-black' : 'bg-neutral-900/80 text-white hover:bg-neutral-800'
          }`}
        >
          {isPlaying ? <Pause size={20} className="fill-black" /> : <Music size={20} />}
        </button>

        <AnimatePresence>
          {isPlaying && (
            <motion.div 
              initial={{ opacity: 0, width: 0, x: -10 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: -10 }}
              className="overflow-hidden whitespace-nowrap bg-neutral-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2"
            >
              <Disc size={14} className="text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-xs font-mono text-neutral-300">Reproduciendo soundtrack</span>
            </motion.div>
          )}
          
          {!hasInteracted && !isPlaying && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-12 left-0 bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
              Encender Audio
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}