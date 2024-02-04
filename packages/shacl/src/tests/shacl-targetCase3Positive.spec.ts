import * as Support from "./support/testSupport";
import TargetCase3ModelCreator from "./support/TargetCase3ModelCreator";

const testType = "targetCase3";
const modelCreator = new TargetCase3ModelCreator();

test('Test SHACL against data - target case #3 POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - target case #3 ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

