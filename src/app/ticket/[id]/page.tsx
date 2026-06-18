import { neon } from '@neondatabase/serverless';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Users, MapPin, Calendar, Clock, AlertCircle, ShieldX } from 'lucide-react';
import VenueMap from '@/components/VenueMap';

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);

  try {
    const guestRows = await sql`SELECT * FROM guests WHERE id = ${id}`;
    const guest = guestRows[0];

    if (!guest) return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center"><AlertCircle size={64} className="text-red-500 mb-4" /><h1 className="text-3xl font-serif">Pase Inexistente</h1></div>;

    if (guest.status === 'pending') {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <Clock size={64} className="text-amber-500 mb-6 animate-pulse relative z-10" />
          <h1 className="text-4xl font-serif mb-4 relative z-10">En Revisión</h1>
          <p className="text-neutral-400 text-lg max-w-md relative z-10">Los novios están validando tu solicitud.</p>
        </div>
      );
    }
    if (guest.status === 'rejected') {
      return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center"><ShieldX size={64} className="text-red-500 mb-4" /><h1 className="text-3xl font-serif text-white">Solicitud Declinada</h1></div>;
    }

    // Extracción de datos del entorno
    const companions = await sql`SELECT * FROM companions WHERE guest_id = ${id}`;
    const tables = await sql`SELECT * FROM tables`;
    const decorations = await sql`SELECT * FROM decorations`;

    // Lógica de Agrupación de Mesas
    const allMembers = [
      { id: guest.id, name: guest.full_name, type: 'Titular', table_id: guest.table_id },
      ...companions.map(c => ({ id: c.id, name: c.full_name, type: 'Acompañante', table_id: c.table_id }))
    ];

    // Extraer todos los IDs únicos de mesas asignadas a este grupo
    const assignedTableIds = Array.from(new Set(allMembers.map(m => m.table_id).filter(Boolean))) as string[];

    // Agrupar miembros por mesa
    const membersByTableId = allMembers.reduce((acc: any, curr) => {
      const tId = curr.table_id || 'unassigned';
      if (!acc[tId]) acc[tId] = [];
      acc[tId].push(curr);
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 relative selection:bg-amber-500 selection:text-black pb-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        
        <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)] relative z-10">
          
          <div className="p-8 text-center relative overflow-hidden border-b border-white/5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4 relative z-10" />
            <h1 className="text-3xl font-serif text-white relative z-10">{guest.full_name}</h1>
            <div className="mt-4 inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest relative z-10">Acceso Confirmado</div>
          </div>

          <div className="p-8 text-center space-y-6 bg-neutral-950/50">
            <div className="bg-white p-5 rounded-3xl inline-block shadow-2xl relative">
              <div className="absolute inset-0 ring-4 ring-black/5 rounded-3xl pointer-events-none"></div>
              <QRCodeSVG value={`/admin/scan?id=${guest.id}`} size={220} fgColor="#0a0a0a" level="H" />
            </div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">Escanea en recepción</p>
          </div>

          {/* ASIGNACIÓN DE MESAS EN TEXTO */}
          {assignedTableIds.length > 0 && (
            <div className="mx-8 mb-8 p-5 bg-black/50 rounded-2xl border border-amber-500/20 space-y-4 shadow-inner">
              <p className="text-[10px] text-amber-500 uppercase font-bold tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Distribución de Asientos</p>
              {Object.keys(membersByTableId).map(tId => {
                if (tId === 'unassigned') return null;
                const tableName = tables.find(t => t.id === tId)?.table_number;
                return (
                  <div key={tId} className="space-y-1">
                    <p className="text-xs font-mono font-bold text-white bg-neutral-900 inline-block px-2 py-1 rounded">Mesa {tableName}</p>
                    <ul className="pl-2">
                      {membersByTableId[tId].map((m: any) => (
                        <li key={m.id} className="text-sm text-neutral-400 flex justify-between">
                          <span>{m.name}</span>
                          <span className="text-[9px] text-neutral-600 uppercase">{m.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              {membersByTableId['unassigned'] && (
                <div className="mt-2 p-2 bg-red-950/30 border border-red-500/20 rounded-lg">
                  <p className="text-[10px] text-red-400 uppercase font-bold">Faltan por asignar:</p>
                  <p className="text-xs text-neutral-300">{membersByTableId['unassigned'].map((m: any) => m.name).join(', ')}</p>
                </div>
              )}
            </div>
          )}

          {/* MAPA VISUAL */}
          {assignedTableIds.length > 0 && (
            <div className="px-8 pb-8 overflow-hidden">
              <VenueMap assignedTableIds={assignedTableIds} tables={tables as any} decorations={decorations as any} />
            </div>
          )}

        </div>
      </div>
    );
  } catch (error) {
    return <div className="text-white bg-black min-h-screen flex items-center justify-center font-mono">Error Interno de Servidor</div>;
  }
}