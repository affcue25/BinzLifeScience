import { randomUUID } from 'node:crypto';
import { getAdmin } from '@/lib/auth';
import { UPLOAD_BUCKET, getSupabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

const EXT_BY_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
};

/** Checks the first bytes so a renamed file cannot slip through. */
function looksRight(ext: string, b: Uint8Array): boolean {
  const ascii = (from: number, len: number) => String.fromCharCode(...b.slice(from, from + len));
  switch (ext) {
    case '.png':
      return b[0] === 0x89 && ascii(1, 3) === 'PNG';
    case '.jpg':
      return b[0] === 0xff && b[1] === 0xd8;
    case '.gif':
      return ascii(0, 4) === 'GIF8';
    case '.webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP';
    case '.pdf':
      return ascii(0, 4) === '%PDF';
    default:
      return false;
  }
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: 'Could not read the upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'No file received.' }, { status: 400 });
  if (file.size === 0) return Response.json({ error: 'The file is empty.' }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'File is too large. The limit is 20 MB.' }, { status: 413 });
  }

  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    return Response.json(
      { error: 'Unsupported file type. Use PNG, JPG, WebP, GIF or PDF.' },
      { status: 415 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksRight(ext, bytes)) {
    return Response.json({ error: 'The file content does not match its type.' }, { status: 415 });
  }

  const name = `${randomUUID()}${ext}`;
  const { error } = await getSupabase().storage.from(UPLOAD_BUCKET).upload(name, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ url: `/uploads/${name}`, name: file.name });
}
