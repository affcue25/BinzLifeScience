'use client';

import { useState } from 'react';

export default function ImageField({
  name,
  label,
  initial = '',
  hint,
}: {
  name: string;
  label: string;
  initial?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed.');
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
      input.value = '';
    }
  }

  return (
    <div className="adm-field">
      <span>{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="adm-image">
        {url ? (
          <img src={url} alt="" className="adm-thumb" />
        ) : (
          <div className="adm-thumb empty">No image</div>
        )}
        <div className="adm-image-actions">
          <label className="adm-btn">
            {busy ? 'Uploading…' : url ? 'Replace image' : 'Upload image'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onFile}
              disabled={busy}
              hidden
            />
          </label>
          {url && (
            <button type="button" className="adm-btn ghost" onClick={() => setUrl('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      {hint && <small>{hint}</small>}
      {error && <small className="adm-msg err">{error}</small>}
    </div>
  );
}
