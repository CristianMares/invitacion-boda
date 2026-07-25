import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { verifyAdminSession, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return unauthorizedResponse();

  try {
    const { phone, message } = await request.json();
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    
    const configRows = await sql`SELECT value FROM event_config WHERE key = 'whatsapp_api_config'`;
    const apiConfig = configRows[0]?.value;

    if (!apiConfig || !apiConfig.enabled || !apiConfig.provider_url) {
      return NextResponse.json({ success: false, mode: 'redirect' });
    }

    // Petición HTTP de fondo al proveedor de WhatsApp (Ej. UltraMsg / Green API)
    const response = await fetch(apiConfig.provider_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: apiConfig.api_token,
        to: `+521${phone}`,
        body: message
      })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, mode: 'api', result: data });

  } catch (error) {
    return NextResponse.json({ error: 'Fallo al procesar envío de WhatsApp' }, { status: 500 });
  }
}