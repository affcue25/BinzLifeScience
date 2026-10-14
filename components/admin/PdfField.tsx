'use client';

import { useState } from 'react';
import type { PdfItem } from '@/lib/types';

/** Upload and name PDF files for a product. Saved as JSON in a hidden input. */
export default function PdfField({
  name,
  label,
  initial,
  hint,
}: {
  name: string;
  label: string;
  initial: PdfItem[];
  hint?: string;
}) {
  const [items, setItems] = useState<PdfItem[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const added: PdfItem[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(`${file.name}: ${data.error || 'Upload failed.'}`);
        added.push({ title: file.name.replace(/\.pdf$/i, ''), url: data.url });
      }
      setItems((prev) => [...prev, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      input.value = '';
    }
  }

  const rename = (i: number, title: string) =>
    setItems((prev) => prev.map((p, idx) => (idx === i ? { ...p, title } : p)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="adm-field">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="adm-list">
        {items.map((pdf, i) => (
          <div key={pdf.url + i} className="adm-list-row">
            <div className="adm-list-fields">
              <label className="adm-field tight">
                <span>Title shown on the website</span>
                <input value={pdf.title} onChange={(e) => rename(i, e.target.value)} />
              </label>
              <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="adm-link">
                Open PDF
              </a>
            </div>
            <div className="adm-list-tools">
              <button type="button" className="adm-btn small danger" onClick={() => remove(i)} aria-label="Remove PDF">
                ✕
              </button>
            </div>
          </div>
        ))}

        <label className="adm-btn">
          {busy ? 'Uploading…' : '+ Upload PDF'}
          <input type="file" accept="application/pdf" multiple onChange={onFile} disabled={busy} hidden />
        </label>
      </div>
      {error && <small className="adm-msg err">{error}</small>}
    </div>
  );
}
