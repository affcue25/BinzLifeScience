'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { canSignup, createSession, destroySession, requireAdmin } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { str } from '@/lib/forms';
import type { FormState } from '@/lib/types';

// Very small in-memory limiter: 8 failed logins per 10 minutes per email.
const attempts = new Map<string, { count: number; resetAt: number }>();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) return false;
  return entry.count >= 8;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else entry.count += 1;
}

type UserRow = { id: number; password_hash: string };

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, 'email').toLowerCase();
  const password = typeof fd.get('password') === 'string' ? (fd.get('password') as string) : '';
  if (!email || !password) return { error: 'Enter your email and password.' };
  if (tooManyAttempts(email)) return { error: 'Too many attempts. Try again in a few minutes.' };

  const { data, error } = await getSupabase()
    .from('users')
    .select('id, password_hash')
    .eq('email', email)
    .maybeSingle();
  if (error) return { error: 'Could not sign in. Check the database connection.' };
  const user = data as UserRow | null;

  // Always run a bcrypt compare so response time does not reveal whether the email exists.
  const ok = bcrypt.compareSync(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !ok) {
    recordFailure(email);
    return { error: 'Incorrect email or password.' };
  }

  await createSession(user.id);
  redirect('/admin');
}

export async function signupAction(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await canSignup())) return { error: 'Sign-up is closed. Ask an existing admin to enable it.' };

  const name = str(fd, 'name');
  const email = str(fd, 'email').toLowerCase();
  const password = typeof fd.get('password') === 'string' ? (fd.get('password') as string) : '';
  const confirm = typeof fd.get('confirm') === 'string' ? (fd.get('confirm') as string) : '';

  if (!name) return { error: 'Enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const supabase = getSupabase();
  const existing = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing.error) return { error: 'Could not create the account. Check the database connection.' };
  if (existing.data) return { error: 'An admin with this email already exists.' };

  const hash = bcrypt.hashSync(password, 10);
  const inserted = await supabase
    .from('users')
    .insert({ email, name, password_hash: hash })
    .select('id')
    .single();
  if (inserted.error || !inserted.data) {
    if (inserted.error?.code === '23505') return { error: 'An admin with this email already exists.' };
    return { error: inserted.error?.message ?? 'Could not create the account.' };
  }

  await createSession(Number(inserted.data.id));
  redirect('/admin');
}

export async function logoutAction() {
  await requireAdmin();
  await destroySession();
  redirect('/admin/login');
}
