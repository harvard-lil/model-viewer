import type { Locator } from "vitest/browser";

declare module "vitest/browser" {
    interface LocatorSelectors {
      getByClassName(className: string): Locator;
      getById(id: string): Locator;
    }
  }
