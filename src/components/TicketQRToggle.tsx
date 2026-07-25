'use client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, CheckCircle2 } from 'lucide-react';

export default function TicketQRToggle({ guestId, hasEntered }: { guestId: string, hasEntered: boolean }) {
  const [showQR, setShowQR] = useState(!hasEntered);

  if (!showQR && hasEntered) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-500/20 p-6 rounded-3xl space-y-4">
        <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
        <p className="text-xs text-neutral-300 font-mono">Pase escaneado en recepción. ¡Disfruta la fiesta!</p>
        <button 
          onClick={() => setShowQR(true)}
          className="px-4 py-2 bg-neutral-900 border border-white/10 hover:border-amber-500/50 rounded-xl text-xs text-amber-400 font-mono inline-flex items-center gap-2"
        >
          <QrCode size={14} /> Mostrar Código QR de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-3xl inline-block shadow-2xl relative">
        <QRCodeSVG value={`/admin/scan?id=${guestId}`} size={200} fgColor="#0a0a0a" level="H" />
      </div>
      <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">Escanea en recepción</p>
      {hasEntered && (
        <button 
          onClick={() => setShowQR(false)} 
          className="text-xs text-neutral-500 underline block mx-auto"
        >
          Ocultar QR
        </button>
      )}
    </div>
  );
}