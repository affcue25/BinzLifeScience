/* Simple form fields for server-rendered admin pages. */

export function TextField({
  name,
  label,
  defaultValue = '',
  hint,
  required,
  placeholder,
  type = 'text',
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="adm-field">
      <span>
        {label}
        {required && ' *'}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
      />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function TextArea({
  name,
  label,
  defaultValue = '',
  hint,
  rows = 4,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      <textarea name={name} rows={rows} defaultValue={defaultValue} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="adm-check">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

export function SelectField({
  name,
  label,
  defaultValue,
  options,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  options: { value: string | number; label: string }[];
  hint?: string;
}) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="adm-section">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

export const RICH_HINT =
  'Leave a blank line between paragraphs. Start a line with "- " for bullet points. Start a line with "## " for a sub heading.';
