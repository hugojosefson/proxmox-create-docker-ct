import { columnRun } from "./run.ts";
import { chooseOne } from "./prompt.ts";

export type StorageType =
  | "zfspool"
  | "dir"
  | "btrfs"
  | "nfs"
  | "cifs"
  | "pbs"
  | "glusterfs"
  | "cephfs"
  | "lvm"
  | "lvmthin"
  | "iscsi"
  | "iscsidirect"
  | "rbd"
  | "zfs";
export type StorageStatus = "active" | unknown;
export interface StorageRow {
  name: string;
  type: StorageType;
  status: StorageStatus;
  total: number;
  used: number;
  available: number;
  "%": string;
}

export type ContentType =
  | typeof CONTENT_VM_IMAGE
  | typeof CONTENT_CT_ROOTDIR
  | typeof CONTENT_CT_TEMPLATE
  | typeof CONTENT_CT_BACKUP
  | typeof CONTENT_ISO
  | typeof CONTENT_SNIPPET;

/** KVM-Qemu VM images. */
export const CONTENT_VM_IMAGE = "images" as const;

/** Allow to store container data. */
export const CONTENT_CT_ROOTDIR = "rootdir" as const;

/** Container templates. */
export const CONTENT_CT_TEMPLATE = "vztmpl" as const;

/** Backup files (vzdump). */
export const CONTENT_CT_BACKUP = "backup" as const;

/** ISO images */
export const CONTENT_ISO = "iso" as const;

/** Snippet files, for example guest hook scripts */
export const CONTENT_SNIPPET = "snippets" as const;

export async function getStorage(
  content: ContentType | undefined,
  descriptive = `"${content}" content`,
  message = `Pick storage for ${descriptive}.`,
): Promise<StorageRow> {
  const choices: StorageRow[] = await getStorages(content);
  if (choices.length === 0) {
    throw new Error(
      `Could not find any active storage that supports ${descriptive}.`,
    );
  }
  const valueProperty = "name";
  const search = true;

  return await chooseOne<StorageRow>({
    choices,
    message,
    valueProperty,
    search,
  });
}

export async function getStorages(
  content?: ContentType,
): Promise<StorageRow[]> {
  return await columnRun<StorageRow>([
    "pvesm",
    "status",
    "-enabled",
    ...(content ? ["-content", content] : []),
  ]);
}
