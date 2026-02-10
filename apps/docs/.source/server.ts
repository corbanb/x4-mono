// @ts-nocheck
import * as __fd_glob_12 from "../content/docs/api-reference/users/users-me.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/api-reference/projects/projects-update.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/api-reference/projects/projects-list.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/api-reference/projects/projects-get.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/api-reference/projects/projects-delete.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/api-reference/projects/projects-create.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/api-reference/a-i/ai-generate.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/rate-limiting.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/errors.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/authentication.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/ai-integration.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"ai-integration.mdx": __fd_glob_1, "authentication.mdx": __fd_glob_2, "errors.mdx": __fd_glob_3, "index.mdx": __fd_glob_4, "rate-limiting.mdx": __fd_glob_5, "api-reference/a-i/ai-generate.mdx": __fd_glob_6, "api-reference/projects/projects-create.mdx": __fd_glob_7, "api-reference/projects/projects-delete.mdx": __fd_glob_8, "api-reference/projects/projects-get.mdx": __fd_glob_9, "api-reference/projects/projects-list.mdx": __fd_glob_10, "api-reference/projects/projects-update.mdx": __fd_glob_11, "api-reference/users/users-me.mdx": __fd_glob_12, });