import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";

const testType = "maxMinCardinalityNegative";
const modelCreator = new MaxMinCardinalityModelCreator();

test.skip('Test SHACL against data - cardinality NEGATIVE ', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
