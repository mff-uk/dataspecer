import * as Support from "./support/testSupport";
import NestedClosedShapeModelCreator from "./support/NestedClosedModelCreator";

const testType = "nestedClosedNegative";
const modelCreator = new NestedClosedShapeModelCreator();

test('Test SHACL against data - nested closed shape NEGATIVE', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

