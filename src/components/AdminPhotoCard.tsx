'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, Check } from 'lucide-react';

export default function AdminPhotoCard({ foto }: { foto: { id: string; cloudinary_url: string; likes: number; is_approved: boolean; guest_message?: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const thumbUrl = foto.cloudinary_url.replace('/upload/', '/upload/c_scale,w_400/q_auto/f_auto/');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: foto.id })
      });
      router.refresh();
    } catch {
      alert('Error al aprobar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar esta foto?')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: foto.id })
      });
      router.refresh();
    } catch {
      alert('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative group rounded-2xl overflow-hidden border bg-neutral-900 transition-all ${foto.is_approved ? 'border-white/10' : 'border-amber-500/50'}`}>
      <Image 
        src={thumbUrl} 
        alt="Foto moderación" 
        width={300} 
        height={300} 
        className="w-full h-44 object-cover"
      />
      
      {!foto.is_approved && (
        <div className="absolute top-2 right-2 bg-amber-500 text-black px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
          Pendiente
        </div>
      )}

      {foto.guest_message && (
        <p className="p-2 text-[10px] text-neutral-300 italic font-serif line-clamp-2 bg-black/80">
          "{foto.guest_message}"
        </p>
      )}

      <div className="p-3 bg-neutral-950 flex items-center justify-between gap-2 border-t border-white/5">
        {!foto.is_approved ? (
          <button 
            onClick={handleApprove} 
            disabled={loading}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
          >
            <Check size={14} /> Aprobar
          </button>
        ) : (
          <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ Visible</span>
        )}
        <button 
          onClick={handleDelete} 
          disabled={loading}
          className="p-2 bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded-lg transition-colors border border-white/5"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}