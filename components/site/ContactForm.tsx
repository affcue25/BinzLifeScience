'use client';

import { useActionState } from 'react';
import { submitMessage } from '@/lib/actions/messages';
import type { FormState } from '@/lib/types';

export default function ContactForm({
  defaultSubject,
  successMessage,
}: {
  defaultSubject: string;
  successMessage: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitMessage, {});

  if (state.ok) {
    return (
      <div className="form-success" role="status">
        {successMessage}
      </div>
    );
  }

  return (
    <form action={action} className="contact-form">
      {/* Honeypot: hidden from people, filled in by bots */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form-row">
        <label>
          Your name *
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label>
          Email *
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Phone
          <input name="phone" maxLength={60} autoComplete="tel" />
        </label>
        <label>
          Subject
          <input name="subject" maxLength={200} defaultValue={defaultSubject} />
        </label>
      </div>
      <label>
        Message *
        <textarea name="message" rows={6} required minLength={5} maxLength={5000} />
      </label>

      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
