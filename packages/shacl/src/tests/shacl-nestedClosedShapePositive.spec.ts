import * as Support from "./support/testSupport";
import NestedClosedModelCreator from "./support/NestedClosedModelCreator";

const testType = "nestedClosed";
const modelCreator = new NestedClosedModelCreator();

test.skip('Test SHACL against data - nested closed shape POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});


test.skip('Shape conforms to SHACL standard - nested closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
