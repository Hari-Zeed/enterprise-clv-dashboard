import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();
  if ((session?.user as any)?.role !== role) redirect('/unauthorized');
  return session;
}

export async function getAuthSession() {
  return await auth();
}
