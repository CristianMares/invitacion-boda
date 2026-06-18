'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

export default function AdminPhotoCard({ foto }: { foto: { id: string; cloudinary_url: string; likes: number } }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Optimización de URL para el panel admin
  const thumbUrl = foto.cloudinary_url.replace('/upload/', '/upload/c_scale,w_300/q_auto/f_auto/');

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar esta foto del muro público?')) return;
    setIsDeleting(true);
    try {
      await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: foto.id })
      });
      router.refresh();
    } catch (error) {
      alert('Error al eliminar');
      setIsDeleting(false);
    }
  };

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-white/10 bg-black transition-all ${isDeleting ? 'opacity-50 scale-95' : ''}`}>
      <Image 
        src={thumbUrl} 
        alt="Foto moderación" 
        width={300} 
        height={300} 
        className="w-full h-40 object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-500/20 text-red-500 border border-red-500/50 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all active:scale-90"
        >
          {isDeleting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Trash2 size={20} />}
        </button>
      </div>
      <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-amber-500 font-mono">
        ♥ {foto.likes}
      </div>
    </div>
  );
}