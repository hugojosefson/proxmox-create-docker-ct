import { fetchFile } from "./deps.ts";

export async function readFromUrl(url: string | URL): Promise<string> {
  const response: Response = await fetchFile(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Deno.errors.NotFound(
        `Could not find "${url}".`,
      );
    }
    throw new Error(
      `Could not read "${url}", got status ${response.status}.`,
    );
  }
  return await response.text();
}
