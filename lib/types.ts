export type FormState = { ok?: boolean; error?: string; message?: string };

export type Feature = { title: string; text: string };
export type PdfItem = { title: string; url: string };

/** Generic row used by the admin list editor. */
export type ListItem = Record<string, string>;
