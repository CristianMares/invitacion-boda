'use client';
import { CalendarPlus } from 'lucide-react';
import * as ics from 'ics';

interface CalendarButtonProps {
  weddingDate?: string;
  title?: string;
  location?: string;
}

export default function CalendarButton({ weddingDate, title, location }: CalendarButtonProps) {
  const downloadICS = () => {
    const dateObj = weddingDate ? new Date(weddingDate) : new Date('2026-12-31T20:00:00');
    
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    const event: ics.EventAttributes = {
      title: title || 'Boda de M & X',
      description: 'Celebra con nosotros este día tan especial. Recuerda llevar tu código QR para el acceso.',
      location: location || 'Hacienda Las Rosas, León, Guanajuato, México',
      start: [year, month, day, hours, minutes],
      duration: { hours: 8, minutes: 0 },
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      alarms: [
        { action: 'display', description: '¡La boda es mañana!', trigger: { hours: 24, minutes: 0, before: true } },
        { action: 'display', description: 'Prepárate, salimos pronto.', trigger: { hours: 2, minutes: 0, before: true } }
      ]
    };

    ics.createEvent(event, (error, value) => {
      if (error) {
        console.error(error);
        return;
      }
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Evento_Boda.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <button 
      onClick={downloadICS}
      className="mt-8 flex items-center gap-2 mx-auto bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-all active:scale-95 border border-white/10 text-xs uppercase tracking-wider font-mono"
    >
      <CalendarPlus size={18} className="text-amber-500" /> Agregar a mi Calendario
    </button>
  );
}