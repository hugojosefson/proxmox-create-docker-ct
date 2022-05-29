import { fetchFile } from "./deps.ts";

export async function readFromUrl(url: string | URL): Promise<string> {
  return await (await fetchFile(url)).text();
}
