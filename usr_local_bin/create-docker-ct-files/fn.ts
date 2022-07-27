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

/**
 * Extract the command to run a script, from its shebang line.
 * @param scriptContents the script source code
 * @returns array of command and parameters
 */
export function extractShebangCommand(scriptContents: string): string[] {
  return scriptContents.split("\n")[0].replace(/^#!/, "").split(" ");
}
