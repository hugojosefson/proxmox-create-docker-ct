import { getCtTemplate, PctEntry, VMID } from "./os.ts";
import { run } from "./run.ts";
import { CONTENT_CT_TEMPLATE, StorageRow } from "./storage.ts";
import { readFromUrl } from "./read-from-url.ts";
import { getNetworkInterface } from "./network.ts";
import { extractShebangCommand, extractValueFromPveShGet } from "./fn.ts";

/**
 * Extracts a short alphanumeric (plus dash) name from a ct base template filename, for example "ubuntu-2204", or "alpine-316".
 * @param filename
 */
export function getShortName(filename: string): string {
  return filename.split("-").slice(0, 2).join("-")
    .replaceAll(/[^a-z0-9-]/g, "");
}

async function getAppdataDir(
  storage: Pick<StorageRow, "name">,
  options: Pick<CtTemplateOptions, "name">,
) {
  const path = extractValueFromPveShGet(
    "path",
    await run([
      "pvesh",
      "get",
      `/storage/${storage.name}`,
    ]),
  );

  if (!path) {
    throw new Error(`Could not find path for storage ${storage.name}.`);
  }
  return `${path}/appdata/${options.name}`;
}

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
  const bridgeName = (await getNetworkInterface("bridge")).name;
  const storageName = (await options.storage()).name;
  const installScript = await readFromUrl(
    new URL(
      `template/${getShortName(options.baseFilename)}-install`,
      import.meta.url,
    ),
  );

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
    `name=eth0,bridge=${bridgeName},firewall=1,ip=dhcp`,
    "--ostype",
    options.baseFilename.split("-")[0],
    "--ssh-public-keys",
    "/root/.ssh/authorized_keys",
    "--timezone",
    "host",
    "--template",
    0,
    "--storage",
    storageName,
    "--unprivileged",
    1,
  ]);
  await run(["pct", "start", vmid]);
  await run(
    ["pct", "exec", vmid, "--", ...extractShebangCommand(installScript)],
    {
      stdin: installScript,
    },
  );
  await run(["pct", "shutdown", vmid]);
  await run(["pct", "template", vmid]);
  return vmid;
}

type CtOptions = {
  templateVmid: VMID;
  vmid?: VMID;
  name: string;
  storage: () => Promise<StorageRow>;
};

export async function createCt(
  options: CtOptions,
): Promise<{ vmid: VMID; appdataDir: string }> {
  const vmid: VMID = options.vmid ??
    parseInt(await run("pvesh get /cluster/nextid"), 10);

  const cloneCmd = [
    "pct",
    "clone",
    options.templateVmid,
    vmid,
    "--hostname",
    options.name,
    "--description",
    (await readFromUrl(new URL("template/summary.md", import.meta.url)))
      .replaceAll("${APP_NAME}", options.name)
      .replaceAll("${DOCKER_CT_TEMPLATE_FILENAME}", `${options.templateVmid}`),
  ];
  await run(cloneCmd).catch(() =>
    run([
      ...cloneCmd,
      "--full",
      1,
    ])
  );
  const storageName = (await options.storage()).name;
  const appdataDir = await getAppdataDir({ name: storageName }, options);
  await Deno.mkdir(appdataDir, { recursive: true });
  await Deno.writeTextFile(
    appdataDir + "/docker-compose.yml",
    await readFromUrl(new URL("template/docker-compose.yml", import.meta.url)),
  );
  await run(["chown", "-R", `${100_000}:${100_000}`, appdataDir]);
  await run([
    "pct",
    "set",
    vmid,
    "--mp0",
    `${appdataDir},mp=/appdata,backup=1`,
  ]);
  return { vmid, appdataDir };
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
