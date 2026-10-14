'use client';

import { useState } from 'react';
import type { ListItem } from '@/lib/types';

type FieldDef = { key: string; label: string; multiline?: boolean };

/** Editable list of rows (stats, features, values...). Saved as JSON in a hidden input. */
export default function ListField({
  name,
  label,
  fields,
  initial,
  addLabel = 'Add item',
  hint,
}: {
  name: string;
  label: string;
  fields: FieldDef[];
  initial: ListItem[];
  addLabel?: string;
  hint?: string;
}) {
  const [items, setItems] = useState<ListItem[]>(initial);

  const update = (i: number, key: string, value: string) =>
    setItems((prev) => prev.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));

  const add = () =>
    setItems((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, '']))]);

  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div className="adm-field">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="adm-list">
        {items.map((row, i) => (
          <div key={i} className="adm-list-row">
            <div className="adm-list-fields">
              {fields.map((f) => (
                <label key={f.key} className="adm-field tight">
                  <span>{f.label}</span>
                  {f.multiline ? (
                    <textarea
                      rows={2}
                      value={row[f.key] ?? ''}
                      onChange={(e) => update(i, f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      value={row[f.key] ?? ''}
                      onChange={(e) => update(i, f.key, e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="adm-list-tools">
              <button type="button" className="adm-btn small" onClick={() => move(i, -1)} aria-label="Move up">
                ↑
              </button>
              <button type="button" className="adm-btn small" onClick={() => move(i, 1)} aria-label="Move down">
                ↓
              </button>
              <button type="button" className="adm-btn small danger" onClick={() => remove(i)} aria-label="Remove">
                ✕
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="adm-btn" onClick={add}>
          + {addLabel}
        </button>
      </div>
    </div>
  );
}
