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
    } catch (_ignore) {
      /* intentional fall-through, and return the input as-is */
    }
  }
  return input;
}

export function omit<T extends Partial<Record<K, unknown>>, K extends keyof T>(
  obj: T,
  omitKeys: K[],
): Omit<T, K> {
  const result: T = {} as T;
  const keys: K[] = Object.keys(obj) as K[];
  for (const key of keys) {
    if (!omitKeys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result as Omit<T, K>;
}

/**
 * Extracts the command to run a script, from its shebang line.
 * @param scriptContents the script source code
 * @returns array of command and parameters
 */
export function extractShebangCommand(scriptContents: string): string[] {
  return scriptContents.split("\n")[0].replace(/^#!/, "").split(" ");
}

/**
 * Extracts a value from a table, output by `pvesh get`.
 * @param key the key to extract
 * @param table the table output by `pvesh get`
 * @returns the value, or undefined if not found
 */
export function extractValueFromPveShGet(
  key: string,
  table: string,
): string | undefined {
  const line: string = table
    .split("\n")
    .map((line) => line.replaceAll(/[│ ]+/g, " ") as string)
    .find((line) => line.startsWith(` ${key} `)) ??
    "";
  const [_, _key, value, __] = line.split(" ");
  return value;
}
