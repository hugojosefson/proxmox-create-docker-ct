import { parseColumns } from "./parse-columns.ts";
import { run } from "./run.ts";

export async function existsCtTemplate(name: string): Promise<boolean> {
  return (await getCtTemplates()).some((pctEntry) => pctEntry?.name === name);
}

export interface PctEntry {
  vmid: number;
  status: string;
  lock?: unknown;
  name: string;
}

export async function getCtTemplates(): Promise<PctEntry[]> {
  return parseColumns(await run("pct list")) as unknown as PctEntry[];
}
