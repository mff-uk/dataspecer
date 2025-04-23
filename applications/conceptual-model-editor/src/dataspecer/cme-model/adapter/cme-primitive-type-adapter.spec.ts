import { describe, test, expect } from "vitest";
import { cmeRdfsLiteral } from "./cme-primitive-type-adapter";

describe("cmeRdfsLiteral", () => {

  /**
   * For internal working we need rdfs:Literal to be part of the primitive types.
   */
  test("Contain rdfs:Literal", () => {
    const actual = cmeRdfsLiteral();
    expect(actual).not.toBeUndefined();
  });

});
