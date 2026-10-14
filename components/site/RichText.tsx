/**
 * Renders the simple text format used in the admin:
 *  - blank line   = new paragraph
 *  - "## Title"   = sub heading
 *  - "- item"     = bullet list (every line of the block starts with "- ")
 * No HTML is ever rendered, so admin text cannot inject markup.
 */
export default function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={`rich ${className ?? ''}`}>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) return <h3 key={i}>{block.slice(3)}</h3>;
        const lines = block.split('\n');
        if (lines.every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.trim().slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {l}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
