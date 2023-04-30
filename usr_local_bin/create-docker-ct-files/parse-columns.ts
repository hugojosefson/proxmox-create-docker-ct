import {
  _parseColumns,
  camelCase,
  mapKeys,
  mapValues,
  parseJsonSafe,
} from "./deps.ts";

export function parseColumns<T>(input: string): T[] {
  const rows: T[] = _parseColumns(input) as T[];
  return rows
    .map((row) => mapKeys(row as Readonly<Record<string, unknown>>, camelCase))
    .map((row) => mapValues(row, parseJsonSafe) as T);
}
