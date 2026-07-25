import { neon } from '@neondatabase/serverless';
import { CheckCircle2, AlertCircle, ShieldX, Clock } from 'lucide-react';
import VenueMap from '@/components/VenueMap';
import TicketQRToggle from '@/components/TicketQRToggle';

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

    const companions = await sql`SELECT * FROM companions WHERE guest_id = ${id}`;
    const tables = await sql`SELECT * FROM tables`;
    const decorations = await sql`SELECT * FROM decorations ORDER BY COALESCE(z_index, 10) ASC`;

    const allMembers = [
      { id: guest.id, name: guest.full_name, type: 'Titular', table_id: guest.table_id },
      ...companions.map(c => ({ id: c.id, name: c.full_name, type: 'Acompañante', table_id: c.table_id }))
    ];

    const assignedTableIds = Array.from(new Set(allMembers.map(m => m.table_id).filter(Boolean))) as string[];

    const membersByTableId = allMembers.reduce((acc: any, curr) => {
      const tId = curr.table_id || 'unassigned';
      if (!acc[tId]) acc[tId] = [];
      acc[tId].push(curr);
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-12 relative selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-5xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 my-auto">
          
          {/* BANNER ENCABEZADO */}
          <div className="p-8 text-center relative overflow-hidden border-b border-white/5">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3 relative z-10" />
            <h1 className="text-3xl md:text-5xl font-serif text-white relative z-10">{guest.full_name}</h1>
            <div className="mt-3 inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest relative z-10">
              {guest.has_entered ? '✓ Ingresó al Evento' : 'Acceso Confirmado'}
            </div>
          </div>

          {/* GRID RESPONSIVO: EN PC SON 2 COLUMNAS, EN MÓVIL 1 */}
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10 items-center">
            
            {/* COLUMNA 1: QR DE ACCESO */}
            <div className="text-center space-y-6 bg-neutral-950/50 p-6 rounded-3xl border border-white/5">
              <TicketQRToggle guestId={guest.id} hasEntered={guest.has_entered} />
            </div>

            {/* COLUMNA 2: DETALLES DE MESA Y NAVEGACIÓN DE SALÓN */}
            <div className="space-y-6">
              {assignedTableIds.length > 0 && (
                <div className="p-6 bg-black/60 rounded-3xl border border-amber-500/20 space-y-4 shadow-inner">
                  <p className="text-xs text-amber-500 uppercase font-bold tracking-[0.2em] border-b border-white/5 pb-2">Distribución de Asientos</p>
                  {Object.keys(membersByTableId).map(tId => {
                    if (tId === 'unassigned') return null;
                    const tableName = tables.find(t => t.id === tId)?.table_number;
                    return (
                      <div key={tId} className="space-y-1">
                        <p className="text-xs font-mono font-bold text-white bg-neutral-900 inline-block px-3 py-1 rounded-lg">Mesa {tableName}</p>
                        <ul className="pl-2 space-y-1 mt-1">
                          {membersByTableId[tId].map((m: any) => (
                            <li key={m.id} className="text-sm text-neutral-300 flex justify-between">
                              <span>{m.name}</span>
                              <span className="text-[10px] text-neutral-500 uppercase font-mono">{m.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* BARRIDO INTERACTIVO DEL MAPA */}
              {assignedTableIds.length > 0 && (
                <VenueMap assignedTableIds={assignedTableIds} tables={tables as any} decorations={decorations as any} />
              )}
            </div>

          </div>

        </div>
      </div>
    );
  } catch (error) {
    return <div className="text-white bg-black min-h-screen flex items-center justify-center font-mono">Error Interno de Servidor</div>;
  }
}