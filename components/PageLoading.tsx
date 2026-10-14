export default function PageLoading({ full = false }: { full?: boolean }) {
  return (
    <div className={full ? 'page-loading page-loading-full' : 'page-loading'} role="status" aria-live="polite">
      <span className="page-loading-spin" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  );
}
