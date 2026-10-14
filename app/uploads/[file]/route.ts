import path from 'node:path';
import { UPLOAD_BUCKET, getSupabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

const notFound = () => new Response('Not found', { status: 404 });

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;

  // Single file name only. No folders, no path tricks.
  const safe = path.basename(file);
  if (safe !== file) return notFound();

  const ext = path.extname(safe).toLowerCase();
  const type = TYPES[ext];
  if (!type) return notFound();

  const { data, error } = await getSupabase().storage.from(UPLOAD_BUCKET).download(safe);
  if (error || !data) return notFound();

  const bytes = new Uint8Array(await data.arrayBuffer());
  const headers: Record<string, string> = {
    'Content-Type': type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  };

  if (ext === '.pdf') {
    // Optional ?n=Nice-Name.pdf gives the download a readable file name.
    const requested = new URL(req.url).searchParams.get('n') ?? safe;
    const clean = requested.replace(/[^\w\-. ]+/g, '').trim() || safe;
    headers['Content-Disposition'] = `inline; filename="${clean.endsWith('.pdf') ? clean : clean + '.pdf'}"`;
  }

  return new Response(bytes, { headers });
}
