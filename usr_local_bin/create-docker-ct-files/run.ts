import { asString, isString, j, omit, parseJsonSafe } from "./fn.ts";
import { weakEnvGet } from "./os.ts";
import { parseColumns } from "./parse-columns.ts";

/** Item in the command array. */
export type SimpleValue = string | number | boolean;

/**
 * What the promise is rejected with, if the command exits with a non-zero exit code.
 */
export interface CommandFailure {
  /** The command that was run. */
  cmd: string[];
  /** {@link Deno.CommandOutput} from the underlying {@link Deno.ChildProcess}. */
  output: Deno.CommandOutput;
  /** What the command printed to STDERR. */
  stderr: string;
  /** What the command printed to STDOUT (as far as it got). */
  stdout: string;
}

/**
 * Actual Error the promise is rejected with, if the command exits with a non-zero exit code.
 */
export class CommandFailureError extends Error implements CommandFailure {
  readonly cmd: string[];
  readonly output: Deno.CommandOutput;
  readonly stderr: string;
  readonly stdout: string;

  constructor(output: Deno.CommandOutput, cmd: string[]) {
    super(
      `Command failed with exit code ${output.code}: ${j(cmd, 0)}`,
    );
    this.cmd = cmd;
    this.output = output;
    this.stderr = asString(output.stderr);
    this.stdout = asString(output.stdout);
  }
}

/**
 * Extra options, to modify how the command runs.
 */
export interface RunOptions
  extends Omit<Deno.CommandOptions, "args" | "stdin" | "stdout" | "stderr"> {
  /** If specified, will be supplied as STDIN to the command. */
  stdin?: string;
  /** Print extra details to STDERR; default to whether env variable `"VERBOSE"` has a truthy value, and `--allow-env` is enabled. */
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
${j({ cmd, options })}
-------------------------------------------------------------------------------`);
  }
  const [executable, ...args] = cmd;

  const commandOptions: Deno.CommandOptions = {
    ...omit(options, ["stdin", "verbose"]),
    args,
    stdin: pipeStdIn ? "piped" : "null",
    stdout: "piped",
    stderr: "piped",
  };
  const command: Deno.Command = new Deno.Command(executable, commandOptions);
  const process: Deno.ChildProcess = command.spawn();

  if (pipeStdIn) {
    const stdinBuf: Uint8Array = new TextEncoder().encode(options.stdin);
    const writer = process.stdin.getWriter();
    try {
      await writer.write(stdinBuf);
    } finally {
      await writer.close();
    }
  }

  const output: Deno.CommandOutput = await process.output();

  if (!output.success) {
    throw new CommandFailureError(output, cmd);
  }

  const stdoutString = asString(output.stdout);
  if (options.verbose) {
    console.error(stdoutString);
  }
  return stdoutString;
}

/**
 * Runs command, returning a Promise for what the command prints to STDOUT. If the command exits with non-zero exit code, the promise rejects with a {@link CommandFailure}.
 * @param command The command to run, as an array of strings, or as a single string. You do not need to quote arguments that contain spaces, when supplying the command as an array. If using the single string format, be careful with spaces.
 * @param options Options for the execution.
 */
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
    if (options.verbose) {
      console.error(j({ cmd, error }));
    }
    throw error;
  }
}

/**
 * Runs a command, just like {@link run}, but parses the response as JSON if possible. Otherwise, returns it as-is.
 * @param command The command to run, as an array of strings, or as a single string. You do not need to quote arguments that contain spaces, when supplying the command as an array. If using the single string format, be careful with spaces.
 * @param options {@link RunOptions} for the execution.
 */
export async function jsonRun<T>(
  command: string | SimpleValue[],
  options: RunOptions = defaultRunOptions,
): Promise<T> {
  return parseJsonSafe(await run(command, options)) as T;
}

export async function columnRun<T>(
  command: string | SimpleValue[],
  options: RunOptions = defaultRunOptions,
): Promise<T[]> {
  return parseColumns<T>(await run(command, options));
}
