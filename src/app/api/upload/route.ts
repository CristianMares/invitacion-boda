import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

cloudinary.config({ secure: true });

export async function POST(request: Request) {
  try {
    const { image, source, filter, guestMessage } = await request.json();
    
    if (!image) return NextResponse.json({ error: 'Payload vacío' }, { status: 400 });

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'boda_mc',
      upload_preset: 'ml_default',
      resource_type: 'auto',
    });

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`
      INSERT INTO event_media (cloudinary_url, source, guest_message, is_approved) 
      VALUES (${uploadResponse.secure_url}, ${source || 'camera'}, ${guestMessage ? guestMessage.trim() : null}, false)
    `;

    return NextResponse.json({ success: true, url: uploadResponse.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error de almacenamiento' }, { status: 500 });
  }
}