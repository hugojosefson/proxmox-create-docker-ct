import { asString, isString, j } from "./fn.ts";
import { weakEnvGet } from "./os.ts";
import { parseColumns } from "./parse-columns.ts";

export type SimpleValue = string | number | boolean;

export interface RunOptions {
  stdin?: string;
  verbose?: boolean;
}

const defaultRunOptions: RunOptions = {
  verbose: !!await weakEnvGet("VERBOSE"),
};

async function tryRun(
  cmd: string[],
  options: RunOptions = defaultRunOptions,
): Promise<string> {
  options = { ...defaultRunOptions, ...options };

  const pipeStdIn = isString(options.stdin);

  if (options.verbose) {
    console.error(`

===============================================================================
${j({ cmd, stdin: options.stdin })}
-------------------------------------------------------------------------------`);
  }
  const process = Deno.run({
    cmd,
    stdin: pipeStdIn ? "piped" : "null",
    stdout: "piped",
    stderr: "piped",
  });

  if (pipeStdIn) {
    const stdinBuf = new TextEncoder().encode(options.stdin);
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
    const stdoutString = asString(stdout);
    if (options.verbose) {
      console.error(stdoutString);
    }
    return stdoutString;
  }
  const reason = {
    ...status,
    stderr: asString(stderr),
  };
  return Promise.reject(reason);
}

export async function run(
  command: string | SimpleValue[],
  options: RunOptions = defaultRunOptions,
): Promise<string> {
  const cmd: string[] = isString(command)
    ? command.split(" ")
    : command.map((segment) => `${segment}`);
  try {
    return await tryRun(cmd, options);
  } catch (error) {
    console.error(j({ cmd, error }));
    throw error;
  }
}

export async function columnRun<T>(
  command: string | SimpleValue[],
  options: RunOptions = defaultRunOptions,
): Promise<T[]> {
  return parseColumns<T>(await run(command, options));
}
