export type IndentStyle = "2" | "3" | "4" | "tab";

export function indentFor(style: IndentStyle): string | number {
  if (style === "tab") return "\t";
  return parseInt(style, 10);
}

export type ParseResult =
  | { ok: true; parsed: unknown; formatted: string }
  | { ok: false; error: string };

export function parseAndFormat(
  text: string,
  indent: IndentStyle,
): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste JSON or load an example to begin." };
  }
  try {
    const parsed = JSON.parse(trimmed);
    const formatted = JSON.stringify(parsed, null, indentFor(indent));
    return { ok: true, parsed, formatted };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON syntax.";
    return { ok: false, error: message };
  }
}

export function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}
