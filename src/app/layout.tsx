import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AudioPlayer from "@/components/AudioPlayer";
import { neon } from '@neondatabase/serverless';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL!);
    const rows = await sql`SELECT key, value FROM event_config WHERE key = 'hero_info'`;
    const hero = rows[0]?.value || {};

    const initials = hero.initials || "M & X";
    const subtitle = hero.subtitle || "Nuestra Boda";
    const description = hero.description || "Invitación oficial y registro de pases.";

    return {
      title: `${initials} | ${subtitle}`,
      description: description,
    };
  } catch {
    return {
      title: "M & X | Nuestra Boda",
      description: "Invitación oficial y registro de pases.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body>
        <AudioPlayer />
        <Navbar />
        {children}
      </body>
    </html>
  );
}