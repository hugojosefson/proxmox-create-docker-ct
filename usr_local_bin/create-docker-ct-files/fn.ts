import { run } from "./run.ts";
import { Select } from "./deps.ts";

export function isString(s?: string | unknown): s is string {
  return typeof s === "string";
}

const decoder = new TextDecoder();
export function asString(buf: Uint8Array | null | undefined): string {
  if (!buf) {
    return "";
  }
  return decoder.decode(buf).trim();
}
export function j(obj: unknown, indentation = 2): string {
  return JSON.stringify(obj, null, indentation);
}

export function parseJsonSafe(input: string | unknown): string | unknown {
  if (isString(input)) {
    try {
      return JSON.parse(input);
    } catch (_ignore) { /* intentional fall-through */ }
  }
  return input;
}

export async function toSelectOptions<T extends Record<string, unknown>>(
  items: T[],
  valueProperty: string,
): Promise<{ name?: string; value: string; disabled?: boolean }[]> {
  if (items.length === 0) {
    return [];
  }
  const headerLineInput: string = Object.keys(items[0]).join(" ");
  const table: string = await run(
    "column --table",
    [
      headerLineInput,
      ...items.map((item) => Object.values(item).join(" ")),
    ].join("\n"),
  );
  const tableLines = table.split("\n");
  const tableWidth = Math.max(...tableLines.map((line) => line.length));

  const [headerLine, ...lines] = tableLines;
  return [
    { name: headerLine, value: "", disabled: true },
    Select.separator("-".repeat(tableWidth)),
    ...lines.map((line, index) => ({
      name: line,
      value: (items[index] && (items[index][valueProperty] as string)) ?? "",
    })),
  ];
}
