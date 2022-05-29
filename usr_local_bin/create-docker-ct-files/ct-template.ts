import { getCtTemplate, PctEntry, VMID } from "./os.ts";
import { run } from "./run.ts";
import { CONTENT_CT_TEMPLATE, StorageRow } from "./storage.ts";
import { readFromUrl } from "./read-from-url.ts";

type CtTemplateOptions = {
  baseTemplateStorage: () => Promise<StorageRow>;
  baseFilename: string;
  storage: () => Promise<StorageRow>;
  name: string;
  filename: string;
  vmid?: VMID;
  cores?: number;
  memoryMegabytes?: number;
};

export async function createCtTemplate(
  options: CtTemplateOptions,
): Promise<VMID> {
  const templateVolumeId = await ensureExistsTemplate(
    options.baseTemplateStorage,
    options.baseFilename,
  );
  const vmid: VMID = options.vmid ??
    parseInt(await run("pvesh get /cluster/nextid"), 10);
  await run([
    "pct",
    "create",
    vmid,
    templateVolumeId,
    "--cores",
    options.cores ?? 2,
    "--description",
    (await readFromUrl(new URL("template/summary.md", import.meta.url)))
      .replaceAll("${APP_NAME}", options.name)
      .replaceAll("${DOCKER_CT_TEMPLATE_FILENAME}", options.baseFilename),
    "--features",
    "nesting=1",
    "--hostname",
    options.name,
    "--memory",
    options.memoryMegabytes ?? 2048,
    "--swap",
    options.memoryMegabytes ?? 2048,
    "--net0",
    "name=eth0,bridge=vmbr0,firewall=1,ip=dhcp",
    "--ostype",
    options.baseFilename.split("-")[0],
    "--ssh-public-keys",
    "/root/.ssh/authorized_keys",
    "--timezone",
    "host",
    "--template",
    0,
    "--storage",
    (await options.storage()).name,
    "--unprivileged",
    1,
  ]);
  await run(["pct", "start", vmid]);
  await run(
    ["pct", "exec", vmid, "--", "/bin/sh"],
    {
      stdin: await readFromUrl(new URL("template/install.sh", import.meta.url)),
    },
  );
  await run(["pct", "shutdown", vmid]);
  await run(["pct", "template", vmid]);
  return vmid;
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

export async function ensureExistsTemplate(
  templateStorage: () => Promise<StorageRow>,
  filename: string,
): Promise<string> {
  await run("pveam update");
  const storageName = (await templateStorage()).name;
  await run([
    "pveam",
    "download",
    storageName,
    filename,
  ]);
  return `${storageName}:${CONTENT_CT_TEMPLATE}/${filename}`;
}
