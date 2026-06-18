import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

cloudinary.config({ secure: true });

export async function POST(request: Request) {
  try {
    const { image, source, filter } = await request.json();
    
    if (!image) return NextResponse.json({ error: 'Payload vacío' }, { status: 400 });

    const transformations = [];
    if (filter === 'sepia') transformations.push({ effect: 'sepia:50' });
    if (filter === 'bw') transformations.push({ effect: 'grayscale' });
    if (filter === 'vintage') transformations.push({ effect: 'art:incognito' });

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'boda_mc',
      upload_preset: 'ml_default',
      resource_type: 'auto', // Habilita subida de .mp4 o .webm
      transformation: transformations.length > 0 ? transformations : undefined,
    });

    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    await sql`INSERT INTO event_media (cloudinary_url, source) VALUES (${uploadResponse.secure_url}, ${source || 'camera'})`;

    return NextResponse.json({ success: true, url: uploadResponse.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Fallo interno de almacenamiento' }, { status: 500 });
  }
}
