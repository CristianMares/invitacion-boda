import { neon } from '@neondatabase/serverless';
import AdminInvitadosClient from '@/components/AdminInvitadosClient';

export const dynamic = 'force-dynamic';

export default async function AdminInvitados() {
  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
  
  const configRows = await sql`SELECT key, value FROM event_config WHERE key IN ('hero_info', 'whatsapp_info')`;
  const configMap: Record<string, any> = {};
  configRows.forEach(r => configMap[r.key] = r.value);

  const heroInfo = configMap.hero_info || { initials: 'M & X' };
  const waTemplate = configMap.whatsapp_info?.template || '¡Hola {nombre}! Tu pase para la boda de {iniciales} está listo. Consulta tu código QR y mesa asignada aquí: {link}';

  const rows = await sql`
    SELECT 
      g.id, g.full_name, g.phone, g.tickets_requested, g.status, g.has_entered, g.sent_wa, g.created_at,
      c.full_name as companion_name, c.description as companion_desc
    FROM guests g
    LEFT JOIN companions c ON g.id = c.guest_id
    ORDER BY g.created_at DESC
  `;

  const guestsMap = new Map<string, any>();
  
  rows.forEach(row => {
    if (!guestsMap.has(row.id)) {
      guestsMap.set(row.id, {
        id: row.id,
        full_name: row.full_name,
        phone: row.phone,
        tickets_requested: row.tickets_requested,
        status: row.status,
        has_entered: row.has_entered,
        sent_wa: row.sent_wa || false,
        created_at: row.created_at,
        companions: []
      });
    }
    if (row.companion_name) {
      guestsMap.get(row.id).companions.push({
        name: row.companion_name,
        desc: row.companion_desc
      });
    }
  });

  const invitados = Array.from(guestsMap.values());

  return (
    <AdminInvitadosClient 
      initialGuests={invitados} 
      heroInitials={heroInfo.initials} 
      waTemplate={waTemplate} 
    />
  );
}