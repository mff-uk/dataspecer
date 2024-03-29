import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";

const testType = "maxMinCardinality";
const modelCreator = new MaxMinCardinalityModelCreator();

test('Test SHACL against data - cardinality POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - cardinality shape', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
