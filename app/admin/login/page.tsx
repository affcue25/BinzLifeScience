import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/admin/AuthForm';
import { loginAction } from '@/lib/actions/auth';
import { canSignup, getAdmin } from '@/lib/auth';
import { getSite } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  const site = await getSite();
  const open = await canSignup();

  return (
    <div className="adm-auth">
      <div className="adm-auth-card">
        <h1>Admin login</h1>
        <p>{site.name}</p>
        <AuthForm
          action={loginAction}
          submitLabel="Log in"
          fields={[
            { name: 'email', label: 'Email', type: 'email', autoComplete: 'username' },
            { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' },
          ]}
        />
        {open && (
          <p style={{ marginTop: '1rem', marginBottom: 0 }}>
            No account yet? <Link href="/admin/signup">Create an admin account</Link>
          </p>
        )}
      </div>
    </div>
  );
}
