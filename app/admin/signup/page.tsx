import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/admin/AuthForm';
import { signupAction } from '@/lib/actions/auth';
import { canSignup, getAdmin, userCount } from '@/lib/auth';
import { getSite } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  if (await getAdmin()) redirect('/admin');
  const site = await getSite();
  const first = (await userCount()) === 0;

  if (!(await canSignup())) {
    return (
      <div className="adm-auth">
        <div className="adm-auth-card">
          <h1>Sign-up is closed</h1>
          <p>
            Admin accounts can only be created by someone who already has access. Ask an existing
            admin, or set <code>ALLOW_ADMIN_SIGNUP=true</code> on the server.
          </p>
          <Link href="/admin/login" className="adm-btn primary block">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-auth">
      <div className="adm-auth-card">
        <h1>{first ? 'Create the first admin' : 'Create an admin account'}</h1>
        <p>{site.name}</p>
        <AuthForm
          action={signupAction}
          submitLabel="Create account"
          fields={[
            { name: 'name', label: 'Your name', autoComplete: 'name' },
            { name: 'email', label: 'Email', type: 'email', autoComplete: 'username' },
            { name: 'password', label: 'Password (8+ characters)', type: 'password', autoComplete: 'new-password' },
            { name: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' },
          ]}
        />
        <p style={{ marginTop: '1rem', marginBottom: 0 }}>
          Already have an account? <Link href="/admin/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
