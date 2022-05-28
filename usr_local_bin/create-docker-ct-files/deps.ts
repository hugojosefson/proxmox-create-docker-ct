import { mapKeys } from "https://deno.land/std@0.141.0/collections/map_keys.ts";
import { mapValues } from "https://deno.land/std@0.141.0/collections/map_values.ts";
import { camelCase } from "https://deno.land/x/case@2.1.1/mod.ts";

import _parseColumns from "https://cdn.skypack.dev/pin/parse-columns@v3.0.0-7lgB0zjFrTuoTzGqeI3T/mode=imports/optimized/parse-columns.js";
import { parseJsonSafe } from "./fn.ts";

export function parseColumns(input: string): Array<Record<string, unknown>> {
  const rows = _parseColumns(input) as Array<Record<string, unknown>>;
  return rows
    .map((row) => mapKeys(row, camelCase))
    .map((row) => mapValues(row, parseJsonSafe));
}
