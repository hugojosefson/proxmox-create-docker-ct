import { asString, isString, j } from "./fn.ts";
import { parseColumns } from "./parse-columns.ts";

async function tryRun(cmd: string[], stdin?: string): Promise<string> {
  const pipeStdIn = isString(stdin);

  const process = Deno.run({
    cmd,
    stdin: pipeStdIn ? "piped" : "null",
    stdout: "piped",
    stderr: "piped",
  });

  if (pipeStdIn) {
    const stdinBuf = new TextEncoder().encode(stdin);
    try {
      await process.stdin?.write(stdinBuf);
    } finally {
      process.stdin?.close();
    }
  }

  const [
    status,
    stdout,
    stderr,
  ] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
  ]);
  process.close();

  if (status.success) {
    return asString(stdout);
  }
  const reason = {
    ...status,
    stderr: asString(stderr),
  };
  return Promise.reject(reason);
}

export async function run(
  command: string | string[],
  stdin?: string,
): Promise<string> {
  const cmd: string[] = isString(command) ? command.split(" ") : command;
  try {
    return await tryRun(cmd, stdin);
  } catch (error) {
    console.error(j({ cmd, error }));
    throw error;
  }
}

export async function columnRun<T>(
  command: string | string[],
  stdin?: string,
): Promise<T[]> {
  return parseColumns<T>(await run(command, stdin));
}
