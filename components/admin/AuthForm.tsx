'use client';

import { useActionState } from 'react';
import type { FormState } from '@/lib/types';

type Field = { name: string; label: string; type?: string; autoComplete?: string };

export default function AuthForm({
  action,
  fields,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="adm-form">
      {fields.map((f) => (
        <label key={f.name} className="adm-field">
          <span>{f.label}</span>
          <input
            name={f.name}
            type={f.type ?? 'text'}
            autoComplete={f.autoComplete}
            required
          />
        </label>
      ))}
      {state.error && (
        <p className="adm-msg err" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="adm-btn primary block" disabled={pending}>
        {pending ? 'Please wait…' : submitLabel}
      </button>
    </form>
  );
}
