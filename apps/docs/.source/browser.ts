// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"ai-integration.mdx": () => import("../content/docs/ai-integration.mdx?collection=docs"), "authentication.mdx": () => import("../content/docs/authentication.mdx?collection=docs"), "errors.mdx": () => import("../content/docs/errors.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "rate-limiting.mdx": () => import("../content/docs/rate-limiting.mdx?collection=docs"), "api-reference/a-i/ai-generate.mdx": () => import("../content/docs/api-reference/a-i/ai-generate.mdx?collection=docs"), "api-reference/users/users-me.mdx": () => import("../content/docs/api-reference/users/users-me.mdx?collection=docs"), "api-reference/projects/projects-create.mdx": () => import("../content/docs/api-reference/projects/projects-create.mdx?collection=docs"), "api-reference/projects/projects-delete.mdx": () => import("../content/docs/api-reference/projects/projects-delete.mdx?collection=docs"), "api-reference/projects/projects-get.mdx": () => import("../content/docs/api-reference/projects/projects-get.mdx?collection=docs"), "api-reference/projects/projects-list.mdx": () => import("../content/docs/api-reference/projects/projects-list.mdx?collection=docs"), "api-reference/projects/projects-update.mdx": () => import("../content/docs/api-reference/projects/projects-update.mdx?collection=docs"), }),
};
export default browserCollections;