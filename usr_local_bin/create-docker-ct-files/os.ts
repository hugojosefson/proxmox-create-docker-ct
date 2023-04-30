import { columnRun } from "./run.ts";

export type VMID = number;

export interface PctEntry {
  vmid: VMID;
  status: string;
  lock?: unknown;
  name: string;
}

export async function getCtTemplate(
  name: string,
): Promise<PctEntry | undefined> {
  const templates = await getCtTemplates();
  return templates.find((template) => template.name === name);
}

export async function getCtTemplates(): Promise<PctEntry[]> {
  return await columnRun("pct list") as unknown as PctEntry[];
}

export async function weakEnvGet(
  variable: string,
): Promise<false | string | undefined> {
  const query: Deno.PermissionDescriptor = { name: "env" as const, variable };
  const permissionResponse: Deno.PermissionStatus = await Deno.permissions
    .query(query);
  const isGranted: boolean = permissionResponse.state === "granted";
  return isGranted && Deno.env.get(variable);
}
