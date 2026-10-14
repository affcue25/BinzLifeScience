'use client';

import { useActionState } from 'react';
import type { FormState } from '@/lib/types';

export default function AdminForm({
  action,
  children,
  submitLabel = 'Save changes',
  className,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className={className ?? 'adm-form'}>
      {children}
      <div className="adm-actions">
        <button type="submit" className="adm-btn primary" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </button>
        {state.error && (
          <span className="adm-msg err" role="alert">
            {state.error}
          </span>
        )}
        {state.message && !state.error && (
          <span className="adm-msg ok" role="status">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
