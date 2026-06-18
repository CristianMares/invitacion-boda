'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, SwitchCamera, Zap, ImagePlus, Paintbrush } from 'lucide-react';

const FILTERS = [
  { id: 'normal', name: 'Original', css: '' },
  { id: 'sepia', name: 'Nostalgia', css: 'sepia-[.85] contrast-125 saturate-50' },
  { id: 'bw', name: 'Noir', css: 'grayscale contrast-125 brightness-90' },
  { id: 'vintage', name: 'Cinematic', css: 'contrast-150 saturate-200 hue-rotate-15 sepia-[.20]' }
];

export default function HybridCameraFlow() {
  const [view, setView] = useState<'menu' | 'retro_cam'>('menu');
  const [shotsLeft, setShotsLeft] = useState(24);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToBackend = async (dataUri: string, source: string) => {
    setIsUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUri, source, filter: 'normal' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Error de servidor');
      setShotsLeft(prev => prev - 1);
    } catch (error) {
      alert("Error en la transmisión de datos.");
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = (e: React.ChangeEvent<HTMLInputElement>, source: string) => {
    const file = e.target.files?.[0];
    if (!file || shotsLeft <= 0) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      if (typeof reader.result === 'string') await uploadToBackend(reader.result, source);
    };
  };

  if (shotsLeft <= 0) {
    return (
      <div className="fixed inset-0 bg-neutral-950 text-amber-500 flex flex-col items-center justify-center p-6 text-center z-50">
        <h1 className="font-serif text-5xl mb-4 italic tracking-widest">Fin.</h1>
        <p className="text-neutral-400 font-light max-w-sm">El carrete está lleno. Las memorias se publicarán pronto.</p>
      </div>
    );
  }

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-neutral-200 italic mb-2">Kodak Moment</h1>
            <p className="text-neutral-500 text-sm">Selecciona el método de captura</p>
            <div className="mt-4 inline-block bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full">
              <span className="text-red-500 font-mono">{shotsLeft}</span>
              <span className="text-neutral-500 text-xs ml-2 uppercase">Fotos restantes</span>
            </div>
          </div>

          <button onClick={() => setView('retro_cam')} className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95">
            <div className="bg-amber-500/10 p-4 rounded-full text-amber-500"><Camera size={32} /></div>
            <div className="text-left">
              <h3 className="text-white font-bold">Cámara Web Retro</h3>
              <p className="text-neutral-500 text-sm">Filtros en vivo, diseño vintage.</p>
            </div>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95">
            <div className="bg-blue-500/10 p-4 rounded-full text-blue-500"><ImagePlus size={32} /></div>
            <div className="text-left">
              <h3 className="text-white font-bold">Subir de Galería / Tomar Foto</h3>
              <p className="text-neutral-500 text-sm">Abre tu cámara nativa o carrete.</p>
            </div>
          </button>

          <input type="file" accept="image/*,video/*" ref={fileInputRef} className="hidden" onChange={(e) => processFile(e, 'upload')} />
          {isUploading && <p className="text-center text-amber-500 animate-pulse mt-4">Procesando archivo...</p>}
        </div>
      </div>
    );
  }

  return <RetroCamUI shotsLeft={shotsLeft} setShotsLeft={setShotsLeft} goBack={() => setView('menu')} />;
}

// ... (El componente RetroCamUI sigue igual que lo tenías abajo de este archivo)
function RetroCamUI({ shotsLeft, setShotsLeft, goBack }: { shotsLeft: number, setShotsLeft: any, goBack: () => void }) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [filterIdx, setFilterIdx] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const toggleCamera = () => setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  const toggleFilter = () => setFilterIdx(prev => (prev + 1) % FILTERS.length);
  const toggleFlash = () => setFlashOn(prev => !prev);

  const capturePhoto = useCallback(async () => {
    if (shotsLeft <= 0 || isUploading || !cameraReady) return;
    if (flashOn) {
      setScreenFlash(true);
      await new Promise(res => setTimeout(res, 150));
    }
    const imageSrc = webcamRef.current?.getScreenshot();
    if (flashOn) setTimeout(() => setScreenFlash(false), 200);
    
    if (imageSrc) {
      setIsUploading(true);
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageSrc, source: 'webcam', filter: FILTERS[filterIdx].id }),
        });
        const data = await res.json();
        if (data.success) setShotsLeft((prev: number) => prev - 1);
      } catch (error) {
        alert("Error de subida");
      } finally {
        setIsUploading(false);
      }
    }
  }, [webcamRef, flashOn, shotsLeft, isUploading, cameraReady, filterIdx]);

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
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none"></div>
        <button onClick={toggleFilter} className="w-14 h-14 bg-gradient-to-br from-[#2a2a2a] to-[#111] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-[#333] text-neutral-400 hover:text-white transition-all active:scale-95 z-10"><Paintbrush size={20} /></button>
        <div className="relative z-10">
          <div className="absolute inset-[-6px] bg-gradient-to-b from-neutral-800 to-black rounded-full blur-[2px]"></div>
          <button onClick={capturePhoto} disabled={isUploading || !cameraReady} className="relative w-20 h-20 bg-gradient-to-b from-[#e5e5e5] to-[#a3a3a3] rounded-full flex items-center justify-center shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_4px_4px_rgba(255,255,255,0.8)] active:translate-y-[2px] transition-all disabled:opacity-50">
            {isUploading ? <div className="w-8 h-8 border-4 border-neutral-800 border-t-transparent rounded-full animate-spin"></div> : <div className="w-16 h-16 bg-gradient-to-b from-[#f5f5f5] to-[#d4d4d4] rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)]"></div>}
          </button>
        </div>
        <button onClick={toggleCamera} className="w-14 h-14 bg-gradient-to-br from-[#2a2a2a] to-[#111] rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-[#333] text-neutral-400 hover:text-white transition-all active:scale-95 z-10"><SwitchCamera size={20} /></button>
      </div>
    </div>
  );
}