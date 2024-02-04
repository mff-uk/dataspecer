import * as Support from "./support/testSupport";
import NestedClosedShapeModelCreator from "./support/NestedClosedModelCreator";

const testType = "nestedClosedNegative";
const modelCreator = new NestedClosedShapeModelCreator();

test.skip('Test SHACL against data - nested closed shape NEGATIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

