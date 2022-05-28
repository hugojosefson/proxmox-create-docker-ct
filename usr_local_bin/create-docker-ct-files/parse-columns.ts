import { parseJsonSafe } from "./fn.ts";
import { _parseColumns, camelCase, mapKeys, mapValues } from "./deps.ts";

export function parseColumns(input: string): Array<Record<string, unknown>> {
  const rows = _parseColumns(input) as Array<Record<string, unknown>>;
  return rows
    .map((row) => mapKeys(row, camelCase))
    .map((row) => mapValues(row, parseJsonSafe));
}
