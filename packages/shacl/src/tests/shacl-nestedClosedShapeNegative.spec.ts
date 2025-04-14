import * as Support from "./support/testSupport.ts";
import NestedClosedShapeModelCreator from "./support/NestedClosedModelCreator.ts";

const testType = "nestedClosedNegative";
const modelCreator = new NestedClosedShapeModelCreator();

test('Test SHACL against data - nested closed shape NEGATIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

