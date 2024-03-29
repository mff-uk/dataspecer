import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";

const testType = "maxMinCardinalityNegative";
const modelCreator = new MaxMinCardinalityModelCreator();

test('Test SHACL against data - cardinality NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
