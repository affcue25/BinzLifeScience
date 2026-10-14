import DeleteForm from '@/components/admin/DeleteForm';
import { deleteMessage, markMessageRead } from '@/lib/actions/messages';
import { getMessages } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const messages = await getMessages();

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Messages</h1>
          <p>Messages sent from the Contact Us form on the website.</p>
        </div>
      </div>

      {messages.length === 0 && <p className="adm-empty">No messages yet.</p>}

      {messages.map((m) => (
        <article key={m.id} className={m.is_read ? 'adm-message' : 'adm-message unread'}>
          <header>
            <strong>
              {m.name} {!m.is_read && <span className="adm-pill ok">New</span>}
            </strong>
            <span className="meta">{m.created_at} UTC</span>
          </header>
          <div className="meta">
            <a href={`mailto:${m.email}`}>{m.email}</a>
            {m.phone ? ` · ${m.phone}` : ''}
          </div>
          {m.subject && <div style={{ marginTop: '0.4rem' }}><strong>{m.subject}</strong></div>}
          <pre>{m.body}</pre>
          <div className="adm-row-actions">
            <form action={markMessageRead.bind(null, m.id, !m.is_read)}>
              <button type="submit" className="adm-btn small">
                {m.is_read ? 'Mark as unread' : 'Mark as read'}
              </button>
            </form>
            <DeleteForm
              action={deleteMessage.bind(null, m.id)}
              confirmText="Delete this message? This cannot be undone."
            />
          </div>
        </article>
      ))}
    </>
  );
}
