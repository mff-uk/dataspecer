import { describe, expect, test } from "vitest";

import { languageStringToString } from "./string";

describe("languageStringToString", () => {

  test("Select preferred from a language string.", () => {
    const actual = languageStringToString([], "cs", { "cs": "text" });
    expect(actual).toBe("text");
  });

  test("Select using preference from a language string.", () => {
    const actual = languageStringToString(["en"], "cs", { "en": "text" });
    expect(actual).toBe("text [en]");
  });

  test("Select anything from a language string.", () => {
    const actual = languageStringToString(["de"], "en", { "cs": "text" });
    expect(actual).toBe("text [cs]");
  });

  test("Select from an empty language string.", () => {
    const actual = languageStringToString(["de"], "en", {});
    expect(actual).toBe("");
  });

  test("Select from a language string should not add empty language.", () => {
    const actual = languageStringToString([], "en", { "": "text" });
    expect(actual).toBe("text");
  });

});
