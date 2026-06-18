'use client';
import { CalendarPlus } from 'lucide-react';
import * as ics from 'ics';

export default function CalendarButton() {
  const downloadICS = () => {
    const event: ics.EventAttributes = {
      title: 'Boda de M & X',
      description: 'Celebra con nosotros este día tan especial. Recuerda llevar tu código QR para el acceso.',
      location: 'Hacienda Las Rosas, León, Guanajuato, México',
      start: [2026, 12, 31, 18, 0], // Año, Mes, Día, Hora, Minuto
      duration: { hours: 8, minutes: 0 },
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      alarms: [
        { action: 'display', description: '¡La boda es mañana!', trigger: { hours: 24, minutes: 0, before: true } },
        { action: 'display', description: 'Preparate, salimos pronto.', trigger: { hours: 2, minutes: 0, before: true } }
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
      link.setAttribute('download', 'Boda_MyC.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <button 
      onClick={downloadICS}
      className="mt-8 flex items-center gap-2 mx-auto bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-all active:scale-95"
    >
      <CalendarPlus size={20} /> Agregar a mi Calendario
    </button>
  );
}
