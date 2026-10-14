'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth';
import { getSupabase } from '@/lib/db';
import { str, text } from '@/lib/forms';
import type { FormState } from '@/lib/types';

// Public contact form: max 5 messages per hour per IP (in memory).
const sent = new Map<string, { count: number; resetAt: number }>();

export async function submitMessage(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot field. Real visitors never fill it in.
  if (str(fd, 'website')) return { ok: true };

  const name = str(fd, 'name');
  const email = str(fd, 'email');
  const phone = str(fd, 'phone');
  const subject = str(fd, 'subject');
  const body = text(fd, 'message');

  if (!name) return { error: 'Please enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (body.length < 5) return { error: 'Please write a message.' };
  if (body.length > 5000) return { error: 'Your message is too long.' };

  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const now = Date.now();
  const entry = sent.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= 5) return { error: 'Too many messages. Please try again later.' };
    entry.count += 1;
  } else {
    sent.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  }

  const { error } = await getSupabase().from('messages').insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    phone: phone.slice(0, 60),
    subject: subject.slice(0, 200),
    body,
  });
  if (error) {
    console.error(error.message);
    return { error: 'Could not send your message. Please try again.' };
  }

  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function markMessageRead(id: number, read: boolean): Promise<void> {
  await requireAdmin();
  const { error } = await getSupabase().from('messages').update({ is_read: read ? 1 : 0 }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin', 'layout');
}

export async function deleteMessage(id: number): Promise<void> {
  await requireAdmin();
  const { error } = await getSupabase().from('messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin', 'layout');
}
