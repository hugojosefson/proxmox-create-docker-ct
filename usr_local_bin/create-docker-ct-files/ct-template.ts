import { getCtTemplate, PctEntry, VMID } from "./os.ts";
import { run } from "./run.ts";
import { parseJsonSafe } from "./fn.ts";
import { CONTENT_CT_TEMPLATE, getStorage, StorageRow } from "./storage.ts";

type CtTemplateOptions = {
  baseFilename: string;
  name: string;
  filename: string;
};

export async function createCtTemplate(
  options: CtTemplateOptions,
): Promise<VMID> {
  await ensureExistsTemplate(options.baseFilename);
  const result = await run("echo 123456");
  return parseJsonSafe(result) as number;
}

export async function ensureExistsCtTemplate(
  options: CtTemplateOptions,
): Promise<VMID> {
  const template: PctEntry | undefined = await getCtTemplate(options.name);
  if (!template) {
    return await createCtTemplate(options);
  }
  return template.vmid;
}

export async function ensureExistsTemplate(filename: string): Promise<void> {
  await run("pveam update");
  const templateStorage: StorageRow = await getStorage(
    CONTENT_CT_TEMPLATE,
    `CT template ${filename}`,
  );
  const downloadResult = await run([
    "pveam",
    "download",
    templateStorage.name,
    filename,
  ]);
  console.error(`Download result for ${filename}:
${downloadResult}
`);
}
