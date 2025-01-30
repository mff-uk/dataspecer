import { describe, expect, test } from "vitest";
import { absoluteIriToRelative, isRelativeIri } from "./iri";

describe("isRelativeIri", () => {

  test("Absolute IRI.", () => {
    const actual = isRelativeIri("http://localhost/page");
    expect(actual).toBeFalsy();
  });

  test("Relative IRI.", () => {
    const actual = isRelativeIri("/localhost/page");
    expect(actual).toBeTruthy();
  });

});

describe("absoluteIriToRelative", () => {

  test("With #.", () => {
    const actual = absoluteIriToRelative("http://localhost/page#name");
    expect(actual).toStrictEqual({
      base: "http://localhost/page#",
      relative: "name",
    });
  });

  test("Without #.", () => {
    const actual = absoluteIriToRelative("http://localhost/page");
    expect(actual).toStrictEqual({
      base: "http://localhost/",
      relative: "page",
    });
  });

});

