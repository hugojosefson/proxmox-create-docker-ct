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
