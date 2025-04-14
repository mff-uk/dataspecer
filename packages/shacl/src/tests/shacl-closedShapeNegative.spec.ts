import * as Support from "./support/testSupport.ts";
import ClosedModelCreator from "./support/ClosedModelCreator.ts";

const testType = "closedNegative";
const modelCreator = new ClosedModelCreator();

test('Test SHACL against data - closed shape NEGATIVE  ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
