import { redirect } from 'next/navigation';

export default function AdminRoot() {
  // Redirige automáticamente al Dashboard cuando entran a /admin
  redirect('/admin/dashboard');
}