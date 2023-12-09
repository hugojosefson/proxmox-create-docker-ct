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
 * @param table the table output by `pvesh get`
 * @param key the key to search for
 * @returns the value, or undefined if not found
 */
export function extractValueFromPveShGet(
  table: string,
  key: string,
): string | undefined;
/**
 * Extracts a value from a table, output by `pvesh get`.
 * @param table the table output by `pvesh get`
 * @param keys the keys to search for
 * @returns the value, or undefined if not found
 */
export function extractValueFromPveShGet(
  table: string,
  keys: string[],
): string | undefined;
/**
 * Extracts a value from a table, output by `pvesh get`.
 * @param table the table output by `pvesh get`
 * @param keyOrKeys the key or keys to search for
 * @returns the value, or undefined if not found
 */
export function extractValueFromPveShGet(
  table: string,
  keyOrKeys: string | string[],
): string | undefined {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  const line: string = table
    .split("\n")
    .map((line) => line.replaceAll(/[│ ]+/g, " ") as string)
    .find((line) => keys.some((key) => line.startsWith(` ${key} `))) ??
    "";
  const [_, _key, value, __] = line.split(" ");
  return value;
}
