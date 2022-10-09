import { expect, Locator } from "@playwright/test";
import type { Match } from "../src/nim";
export { expect, test } from "@playwright/test";

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toHaveState(state: Match | "selected"): Promise<R>;
    }
  }
}

expect.extend({
  async toHaveState(match: Locator, state: Match | "selected") {
    const attr = await match.getAttribute("data-state");

    if (attr === state) {
      return {
        pass: true,
        message: () => `The provided match has the expected state "${state}".`,
      };
    } else {
      return {
        pass: false,
        message: () =>
          `The provided match has the state "${attr}" but required "${state}".`,
      };
    }
  },
});
