import * as Support from "./support/testSupport";
import ClosedModelCreator from "./support/ClosedModelCreator";

const testType = "closedNegative";
const modelCreator = new ClosedModelCreator();

test.skip('Test SHACL against data - closed shape NEGATIVE  ', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
