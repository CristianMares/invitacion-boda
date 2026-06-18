'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Heart, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface MediaData {
  id: string;
  cloudinary_url: string;
  created_at: string;
  likes: number;
}

export default function GalleryGrid({ initialMedia }: { initialMedia: MediaData[] }) {
  const [media, setMedia] = useState<MediaData[]>(initialMedia);
  const [loadingLikes, setLoadingLikes] = useState<Record<string, boolean>>({});

  const handleLike = async (id: string) => {
    if (loadingLikes[id]) return;
    
    // Optimistic UI Update (Respuesta inmediata al usuario)
    setMedia(current => 
      current.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item)
    );
    setLoadingLikes(prev => ({ ...prev, [id]: true }));

    try {
      await fetch('/api/media/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (error) {
      // Revertir en caso de fallo
      setMedia(current => 
        current.map(item => item.id === id ? { ...item, likes: item.likes - 1 } : item)
      );
    } finally {
      setLoadingLikes(prev => ({ ...prev, [id]: false }));
    }
  };

  // Forzar compresión en Cloudinary (Calidad auto, Formato auto, Ancho max 800px)
  const optimizeUrl = (url: string) => {
    return url.replace('/upload/', '/upload/c_scale,w_800/q_auto/f_auto/');
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {media.map((foto, index) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "50px" }}
          transition={{ duration: 0.5, delay: (index % 10) * 0.1 }}
          key={foto.id} 
          className="break-inside-avoid group relative rounded-3xl overflow-hidden shadow-lg border border-white/10 bg-neutral-900"
        >
          <Image 
            src={optimizeUrl(foto.cloudinary_url)} 
            alt="Recuerdo de boda" 
            width={800} 
            height={800}
            loading="lazy"
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-5">
            <div className="flex items-center gap-2 text-neutral-300 text-xs font-mono">
              <Camera size={14} className="text-amber-500" />
              <span>{new Date(foto.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            
            <button 
              onClick={() => handleLike(foto.id)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-90"
            >
              <Heart size={16} className={foto.likes > 0 ? "fill-red-500 text-red-500" : "text-white"} />
              <span className="text-white font-bold text-xs">{foto.likes}</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}