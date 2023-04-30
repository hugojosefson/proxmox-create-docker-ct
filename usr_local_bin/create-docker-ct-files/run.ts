import { defaultRunOptions, run, RunOptions, SimpleValue } from "./deps.ts";
import { parseColumns } from "./parse-columns.ts";

export async function columnRun<T>(
  command: string | SimpleValue[],
  options: RunOptions = defaultRunOptions,
): Promise<T[]> {
  return parseColumns<T>(await run(command, options));
}
