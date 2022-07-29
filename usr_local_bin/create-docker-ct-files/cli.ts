#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.24";DENO_RUN_ARGS="-qA --unstable";set -e;V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";U="$(expr "$(echo "$V"|curl -Gso/dev/null -w%{url_effective} --data-urlencode @- "")" : '..\(.*\)...')";D="$(command -v deno||true)";t(){ d="$(mktemp)";rm "${d}";dirname "${d}";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.4.0/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};g(){ curl -sSfL "https://semver-version.deno.dev/api/github/denoland/deno/$U";};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;v="$(g)";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;([ "${A#*-q}" != "$A" ]&&exec 2>/dev/null;curl -fsSL https://deno.land/install.sh|DENO_INSTALL="$i" sh -s $DENO_INSTALL_ARGS "$v">&2);};e;exec "$R/deno" run $A "$(readlink -f "$0")" "$@"
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
  "alpine-3.16-default_20220622_amd64.tar.xz",
  "alpine-3.15-default_20211202_amd64.tar.xz",
  "ubuntu-22.04-standard_22.04-1_amd64.tar.zst",
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
