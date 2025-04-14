import * as Support from "./support/testSupport.ts";
import ClosedModelCreator from "./support/ClosedModelCreator.ts";

const testType = "closed";
const modelCreator = new ClosedModelCreator();

test('Test SHACL against data - closed shape POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
