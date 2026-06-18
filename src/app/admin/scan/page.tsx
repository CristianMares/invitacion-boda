'use client';
import { useState, useEffect, Suspense } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Users, AlertTriangle, ShieldX, PartyPopper } from 'lucide-react';

// 1. Componente que consume los parámetros
function ScanContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const success = searchParams.get('success');

  if (success === 'true') return <SuccessView />;
  if (id) return <CheckInView id={id} />;
  
  return <QRScannerView />;
}

// 2. Exportación con el Límite de Suspenso (Obligatorio para Vercel)
export default function ScanPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-500 font-mono">Iniciando escáner...</div>}>
      <ScanContent />
    </Suspense>
  );
}

// 3. VISTA DE ESCANEO
function QRScannerView() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white selection:bg-amber-500">
      <div className="w-full max-w-md bg-black border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif text-white">Recepción</h1>
          <p className="text-amber-500 font-mono text-xs uppercase tracking-widest mt-1">Escáner Activo</p>
        </div>
        
        <div className="rounded-2xl overflow-hidden border-4 border-neutral-900 relative aspect-square">
          <div className="absolute inset-0 border-2 border-amber-500 border-dashed z-10 pointer-events-none opacity-50"></div>
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0) {
                router.push(result[0].rawValue);
              }
            }}
            components={{ audio: false, finder: false }}
          />
        </div>
        <p className="text-center text-xs text-neutral-500 mt-6 font-mono">Apunta el código del invitado hacia la cámara.</p>
      </div>
    </div>
  );
}

// 4. VISTA DE VALIDACIÓN
function CheckInView({ id }: { id: string }) {
  const router = useRouter();

  const handleCheckIn = async () => {
    try {
      await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      router.push('/admin/scan?success=true');
    } catch (e) {
      alert("Error procesando check-in");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="bg-neutral-900/80 p-8 rounded-[2rem] border border-amber-500/30 text-center max-w-md w-full shadow-2xl backdrop-blur-xl">
        <AlertTriangle size={64} className="text-amber-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-2xl font-serif text-white mb-2">Validando ID:</h1>
        <p className="text-xs font-mono text-neutral-500 break-all bg-black p-2 rounded">{id}</p>
        
        <button onClick={handleCheckIn} className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          Forzar Entrada (Confirmar)
        </button>
        <button onClick={() => router.push('/admin/scan')} className="mt-4 w-full bg-transparent border border-white/20 text-neutral-400 font-bold py-4 rounded-xl transition-all">
          Cancelar y Volver
        </button>
      </div>
    </div>
  );
}

// 5. VISTA DE ÉXITO
function SuccessView() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-neutral-900/50 p-10 rounded-[2rem] border border-emerald-500/30 max-w-md w-full">
        <PartyPopper size={80} className="text-emerald-500 mx-auto mb-6" />
        <h1 className="text-4xl font-serif text-white mb-2">Check-in Exitoso</h1>
        <p className="text-neutral-400 mb-8">La entrada ha sido registrada.</p>
        <button onClick={() => router.push('/admin/scan')} className="bg-white text-black font-bold py-4 px-8 rounded-xl w-full">
          Escanear Siguiente
        </button>
      </div>
    </div>
  );
}