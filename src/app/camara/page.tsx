'use client';
import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, ImagePlus, Paintbrush, Send, MessageSquareText, Zap, SwitchCamera, CheckCircle2 } from 'lucide-react';

const FILTERS = [
  { id: 'normal', name: 'Original', css: '' },
  { id: 'sepia', name: 'Nostalgia', css: 'sepia-[.85] contrast-125 saturate-50' },
  { id: 'bw', name: 'Noir', css: 'grayscale contrast-125 brightness-90' },
  { id: 'vintage', name: 'Cinematic', css: 'contrast-150 saturate-200 hue-rotate-15 sepia-[.20]' }
];

export default function HybridCameraFlow() {
  const [view, setView] = useState<'menu' | 'retro_cam' | 'preview' | 'success'>('menu');
  const [shotsLeft, setShotsLeft] = useState(24);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [guestMessage, setGuestMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (dataUrl: string, maxWidth = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  const uploadToBackend = async (dataUri: string, source: string, msg: string) => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      const optimizedUri = await resizeImage(dataUri);
      const res = await fetch('/api/upload', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: optimizedUri, source, filter: 'normal', guestMessage: msg }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error de servidor');
      
      setShotsLeft(prev => prev - 1);
      setView('success');
      setTimeout(() => {
        setView('menu');
        setCapturedImage(null);
        setGuestMessage('');
      }, 2500);

    } catch (error) {
      alert("Error en la transmisión de datos. Intenta nuevamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = (e: React.ChangeEvent<HTMLInputElement>, source: string) => {
    const file = e.target.files?.[0];
    if (!file || shotsLeft <= 0) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        setView('preview');
      }
    };
  };

  if (view === 'success') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center animate-in zoom-in duration-300">
        <CheckCircle2 size={72} className="text-emerald-400 mb-4 animate-bounce" />
        <h1 className="text-3xl font-serif">¡Foto Publicada!</h1>
        <p className="text-neutral-400 text-sm mt-2 font-mono">Tu recuerdo se ha subido al muro de la boda.</p>
      </div>
    );
  }

  if (shotsLeft <= 0) {
    return (
      <div className="fixed inset-0 bg-neutral-950 text-amber-500 flex flex-col items-center justify-center p-6 text-center z-50">
        <h1 className="font-serif text-5xl mb-4 italic tracking-widest">Fin.</h1>
        <p className="text-neutral-400 font-light max-w-sm">El carrete está lleno. Las memorias se publicarán pronto.</p>
      </div>
    );
  }

  if (view === 'preview') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-serif text-center">Firma tu Recuerdo</h2>
          <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 relative">
            <img src={capturedImage || ''} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
              <MessageSquareText size={14} className="text-amber-500" />
              <span>Dedicatoria para los novios:</span>
            </div>
            <input 
              type="text" 
              maxLength={80}
              placeholder="Ej. ¡Muchas felicidades! - Familia Pérez" 
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('menu')} disabled={isUploading} className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">Cancelar</button>
            <button onClick={() => capturedImage && uploadToBackend(capturedImage, 'upload', guestMessage)} disabled={isUploading} className="flex-1 bg-amber-600 hover:bg-amber-500 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              {isUploading ? 'Publicando...' : <><Send size={14} /> Publicar</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-neutral-200 italic mb-2">Libro de Firmas</h1>
            <p className="text-neutral-500 text-sm">Captura un momento y déjanos un mensaje</p>
            <div className="mt-4 inline-block bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full">
              <span className="text-red-500 font-mono">{shotsLeft}</span>
              <span className="text-neutral-500 text-xs ml-2 uppercase">Fotos restantes</span>
            </div>
          </div>

          {/* RECOMENDACIÓN DE USO DE GALERÍA */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-200/90 leading-relaxed text-center">
            💡 <strong>Recomendación:</strong> Toma tu foto o video con la cámara nativa de tu teléfono y súbela desde la <strong>Galería</strong> para aprovechar el máximo enfoque y resolución de tu dispositivo.
          </div>

          <button onClick={() => setView('retro_cam')} className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95">
            <div className="bg-amber-500/10 p-4 rounded-full text-amber-500"><Camera size={32} /></div>
            <div className="text-left">
              <h3 className="text-white font-bold">Cámara Web Retro</h3>
              <p className="text-neutral-500 text-sm">Filtros en vivo en navegador.</p>
            </div>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95">
            <div className="bg-blue-500/10 p-4 rounded-full text-blue-500"><ImagePlus size={32} /></div>
            <div className="text-left">
              <h3 className="text-white font-bold">Subir de Galería (Recomendado)</h3>
              <p className="text-neutral-500 text-sm">Sube fotos o videos en alta calidad.</p>
            </div>
          </button>

          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => processFile(e, 'upload')} />
        </div>
      </div>
    );
  }

  return <RetroCamUI shotsLeft={shotsLeft} setShotsLeft={setShotsLeft} goBack={() => setView('menu')} uploadToBackend={uploadToBackend} isUploading={isUploading} />;
}

function RetroCamUI({ shotsLeft, setShotsLeft, goBack, uploadToBackend, isUploading }: any) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [filterIdx, setFilterIdx] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [guestMessage, setGuestMessage] = useState('');

  const toggleCamera = () => setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  const toggleFilter = () => setFilterIdx(prev => (prev + 1) % FILTERS.length);
  const toggleFlash = () => setFlashOn(prev => !prev);

  const capturePhoto = useCallback(async () => {
    if (shotsLeft <= 0 || !cameraReady) return;
    if (flashOn) {
      setScreenFlash(true);
      await new Promise(res => setTimeout(res, 150));
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (flashOn) setTimeout(() => setScreenFlash(false), 200);
    
    if (imageSrc) {
      setTempImage(imageSrc);
      setMsgModal(true);
    }
  }, [webcamRef, flashOn, shotsLeft, cameraReady]);

  if (msgModal) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-white z-50">
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-xl font-serif text-center">Firma tu Recuerdo</h2>
          <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 relative">
            <img src={tempImage || ''} alt="Captured" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
              <MessageSquareText size={14} className="text-amber-500" />
              <span>Dedicatoria para los novios:</span>
            </div>
            <input 
              type="text" 
              maxLength={80}
              placeholder="Ej. ¡Los queremos mucho! - Los Gómez" 
              value={guestMessage}
              onChange={(e) => setGuestMessage(e.target.value)}
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMsgModal(false)} disabled={isUploading} className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl font-bold text-xs uppercase tracking-wider">Repetir Foto</button>
            <button onClick={() => tempImage && uploadToBackend(tempImage, 'webcam', guestMessage)} disabled={isUploading} className="flex-1 bg-amber-600 hover:bg-amber-500 text-black py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
              {isUploading ? 'Publicando...' : <><Send size={14} /> Publicar</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      <div className="flex-1 relative bg-neutral-900 overflow-hidden">
        {screenFlash && <div className="absolute inset-0 bg-white z-[100]"></div>}
        <button onClick={toggleFlash} className={`absolute top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md border transition-all ${flashOn ? 'bg-amber-500 border-amber-400 text-white' : 'bg-black/40 border-white/20 text-white'}`}><Zap size={20} /></button>
        <button onClick={goBack} className="absolute top-6 left-6 z-50 px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white text-xs uppercase tracking-widest">Volver</button>
        <div className="absolute inset-x-0 bottom-6 flex justify-center z-50 pointer-events-none"><span className="bg-black/60 backdrop-blur px-3 py-1 rounded text-amber-400 text-xs uppercase tracking-widest border border-white/10">{FILTERS[filterIdx].name}</span></div>
        <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} onUserMedia={() => setCameraReady(true)} className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${FILTERS[filterIdx].css}`} />
      </div>
      <div className="h-40 bg-[#151515] border-t-8 border-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)] flex items-center justify-around px-4 relative z-40">
        <button onClick={toggleFilter} className="w-14 h-14 bg-gradient-to-br from-[#2a2a2a] to-[#111] rounded-full flex items-center justify-center border border-[#333] text-neutral-400 hover:text-white transition-all active:scale-95"><Paintbrush size={20} /></button>
        <div className="relative">
          <button onClick={capturePhoto} disabled={!cameraReady || isUploading} className="relative w-20 h-20 bg-gradient-to-b from-[#e5e5e5] to-[#a3a3a3] rounded-full flex items-center justify-center active:translate-y-[2px] transition-all disabled:opacity-50">
            <div className="w-16 h-16 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)]"></div>
          </button>
        </div>
        <button onClick={toggleCamera} className="w-14 h-14 bg-gradient-to-br from-[#2a2a2a] to-[#111] rounded-full flex items-center justify-center border border-[#333] text-neutral-400 hover:text-white transition-all active:scale-95"><SwitchCamera size={20} /></button>
      </div>
    </div>
  );
}