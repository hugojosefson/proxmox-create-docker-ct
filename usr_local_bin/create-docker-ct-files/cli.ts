/**
 * via https://github.com/hugojosefson/proxmox-create-docker-ct
 * License: MIT
 * Copyright (c) 2022 Hugo Josefson
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  createCt,
  ensureExistsCtTemplate,
  getShortName,
} from "./ct-template.ts";
import {
  CONTENT_CT_ROOTDIR,
  CONTENT_CT_TEMPLATE,
  getStorage,
} from "./storage.ts";
import { VMID } from "./os.ts";

/** template filenames we support. the first one is default if user does not specify. */
const compatibleTemplates = [
  "alpine-3.17-default_20221129_amd64.tar.xz",
  "alpine-3.16-default_20220622_amd64.tar.xz",
  "alpine-3.15-default_20211202_amd64.tar.xz",
  "ubuntu-22.04-standard_22.04-1_amd64.tar.zst",
  "debian-12-standard_12.0-1_amd64.tar.zst",
];

const defaultTemplate = compatibleTemplates[0];
const [name, CT_BASE_TEMPLATE_FILENAME = defaultTemplate] = Deno.args;

function usageAndExit(code = 2): never {
  console.error(`USAGE:

  create-docker-ct --help                              This help message
  create-docker-ct <name>                              Create a CT from ${defaultTemplate}
  create-docker-ct <name> [<base_template_filename>]   Create a CT from specified base template

EXAMPLE:

  create-docker-ct my-service
  ${
    compatibleTemplates.map((filename) =>
      `create-docker-ct my-service ${filename}`
    ).join("\n  ")
  }
`);
  Deno.exit(code);
}

if (!name || name === "--help") {
  usageAndExit();
}

const DOCKER_CT_TEMPLATE_NAME = "docker-ct-" +
  getShortName(CT_BASE_TEMPLATE_FILENAME);
const DOCKER_CT_TEMPLATE_FILENAME = `docker-ct-${CT_BASE_TEMPLATE_FILENAME}`;

const templateVmid: VMID = await ensureExistsCtTemplate({
  baseTemplateStorage: () =>
    getStorage(
      CONTENT_CT_TEMPLATE,
      CT_BASE_TEMPLATE_FILENAME,
    ),
  baseFilename: CT_BASE_TEMPLATE_FILENAME,
  storage: () =>
    getStorage(
      CONTENT_CT_ROOTDIR,
      DOCKER_CT_TEMPLATE_FILENAME,
    ),
  name: DOCKER_CT_TEMPLATE_NAME,
  filename: DOCKER_CT_TEMPLATE_FILENAME,
});

const { vmid, appdataDir } = await createCt({
  templateVmid,
  name,
  storage: () =>
    getStorage(
      undefined,
      `appdata for CT ${name}`,
    ),
});

console.log(vmid);
console.log(appdataDir);
