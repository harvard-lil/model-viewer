import { locators } from "vitest/browser";

locators.extend({
  getByClassName(className: string) {
    return `[class*="${className}"]`;
  },
  getById(id: string) {
    return `#${id}`;
  },
});
