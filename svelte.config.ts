import adapter from "@sveltejs/adapter-static";
import type { Config } from "@sveltejs/kit";

export default {
    kit: {
      adapter: adapter({
        pages: "docs",
        assets: "docs",
        fallback: undefined,
        precompress: false,
        strict: true
      }),
      paths: {
        base: "/model-viewer",
        relative: false
      }
    }
  } satisfies Config;
