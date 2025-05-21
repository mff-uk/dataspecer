import { describe, test, expect } from "vitest";
import { readDataSpecifications } from "./data-specification-model-reader.ts";

describe("readDataSpecifications", () => {

  test.skip("Read data-specification-vocabulary.", async () => {
    const url = "https://ofn.gov.cz/dcat-ap-cz/draft/";
    const dataSpecification = await readDataSpecifications(url);
    console.log("Data specification:\n", JSON.stringify(dataSpecification, null, 2));
  }, 10 * 1000);

});
