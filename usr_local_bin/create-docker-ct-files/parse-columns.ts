import { parseJsonSafe } from "./fn.ts";
import { _parseColumns, camelCase, mapKeys, mapValues } from "./deps.ts";
import { run } from "./run.ts";

export function parseColumns<T>(input: string): T[] {
  const rows: T[] = _parseColumns(input) as T[];
  return rows
    .map((row) => mapKeys(row as Readonly<Record<string, unknown>>, camelCase))
    .map((row) => mapValues(row, parseJsonSafe) as T);
}

async function withHeaders(input: string, headers: string[]): Promise<string> {
  return await run(
    ["column", "--table", "--table-columns", ...headers.join(",")],
    { stdin: input },
  );
}
