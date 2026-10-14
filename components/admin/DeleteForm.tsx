'use client';

export default function DeleteForm({
  action,
  confirmText,
  label = 'Delete',
}: {
  action: () => Promise<void>;
  confirmText: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="adm-btn danger">
        {label}
      </button>
    </form>
  );
}
