// Create an admin user, or reset a password, from the command line.
// Usage:  npm run create-admin -- you@example.com "a-strong-password" "Your Name"
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

function loadEnv(file, override) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) return;
  for (const line of fs.readFileSync(full, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv('.env', false);
loadEnv('.env.local', true);

const [email, password, name = 'Admin'] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> [name]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env first.');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const hash = bcrypt.hashSync(password, 10);
const normalized = email.toLowerCase();
const existing = await supabase.from('users').select('id').eq('email', normalized).maybeSingle();
if (existing.error) {
  console.error(existing.error.message);
  process.exit(1);
}

if (existing.data) {
  const updated = await supabase.from('users').update({ password_hash: hash }).eq('id', existing.data.id);
  if (updated.error) {
    console.error(updated.error.message);
    process.exit(1);
  }
  console.log(`Password updated for ${normalized}`);
} else {
  const inserted = await supabase.from('users').insert({ email: normalized, name, password_hash: hash });
  if (inserted.error) {
    console.error(inserted.error.message);
    process.exit(1);
  }
  console.log(`Admin created: ${normalized}`);
}
