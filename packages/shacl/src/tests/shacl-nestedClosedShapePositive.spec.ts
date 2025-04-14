import * as Support from "./support/testSupport.ts";
import NestedClosedModelCreator from "./support/NestedClosedModelCreator.ts";

const testType = "nestedClosed";
const modelCreator = new NestedClosedModelCreator();

test('Test SHACL against data - nested closed shape POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});


test('Shape conforms to SHACL standard - nested closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
