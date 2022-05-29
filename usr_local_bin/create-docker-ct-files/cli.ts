#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.22.1";DENO_RUN_ARGS="-A --unstable";set -e;V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";U="$(expr "$(echo "$V"|curl -Gso/dev/null -w%{url_effective} --data-urlencode @- "")" : '..\(.*\)...')";D="$(command -v deno||true)";t(){ d="$(mktemp)";rm "${d}";dirname "${d}";};f(){ m="$(command -v "$0"||true)";l="/* 2>/dev/null";! [ -z $m ]&&[ -r $m ]&&[ "$(head -c3 "$m")" = '#!/' ]&&(read x && read y &&[ "$x" = "#!/bin/sh" ]&&[ "$l" != "${y%"$l"*}" ])<"$m";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.4.0/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};g(){ curl -sSfL "https://api.mattandre.ws/semver/github/denoland/deno/$U";};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;v="$(g)";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;curl -fsSL https://deno.land/install.sh|DENO_INSTALL="$i" sh -s "$v">&2;};e;f&&exec deno run $A "$(readlink -f "$0")" "$@";exec deno run $A - "$@"<<'//🔚'
/**
 * via https://github.com/hugojosefson/proxmox-create-docker-ct
 * License: MIT
 * Copyright (c) 2022 Hugo Josefson
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ensureExistsCtTemplate } from "./ct-template.ts";
import { CONTENT_CT_TEMPLATE, getStorage } from "./storage.ts";

const CT_BASE_TEMPLATE_FILENAME = "ubuntu-22.04-standard_22.04-1_amd64.tar.zst";
const DOCKER_CT_TEMPLATE_NAME = "docker-ct-ubuntu-2204";
const DOCKER_CT_TEMPLATE_FILENAME = `docker-ct-${CT_BASE_TEMPLATE_FILENAME}`;

const templateId: number = await ensureExistsCtTemplate({
  baseTemplateStorage: () =>
    getStorage(
      CONTENT_CT_TEMPLATE,
      CT_BASE_TEMPLATE_FILENAME,
    ),
  baseFilename: CT_BASE_TEMPLATE_FILENAME,
  storage: () =>
    getStorage(
      CONTENT_CT_TEMPLATE,
      DOCKER_CT_TEMPLATE_FILENAME,
    ),
  name: DOCKER_CT_TEMPLATE_NAME,
  filename: DOCKER_CT_TEMPLATE_FILENAME,
});

console.log(`CT template: ${templateId}`);

//🔚
