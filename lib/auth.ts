import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { dbError, getSupabase } from './db';

export const SESSION_COOKIE = 'binz_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminUser = { id: number; email: string; name: string };

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET must be set in production. See .env.example');
    }
    return new TextEncoder().encode('dev-only-insecure-secret-change-me-before-deploying');
  }
  return new TextEncoder().encode(s);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== 'true',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Returns the signed-in admin, or null. Verifies the user still exists. */
export async function getAdmin(): Promise<AdminUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const uid = Number(payload.uid);
    if (!uid) return null;
    const { data, error } = await getSupabase()
      .from('users')
      .select('id, email, name')
      .eq('id', uid)
      .maybeSingle();
    if (error || !data) return null;
    return { id: Number(data.id), email: data.email, name: data.name ?? '' };
  } catch {
    return null;
  }
}

/** Use at the top of every admin page and every server action. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

export async function userCount(): Promise<number> {
  const { count, error } = await getSupabase().from('users').select('*', { count: 'exact', head: true });
  if (error) dbError(error, 'Could not count admins');
  return count ?? 0;
}

/** The first admin can always sign up. Later sign-ups need ALLOW_ADMIN_SIGNUP=true. */
export async function canSignup(): Promise<boolean> {
  return (await userCount()) === 0 || process.env.ALLOW_ADMIN_SIGNUP === 'true';
}
