import * as Support from "./support/testSupport";
import TargetCase2ModelCreator from "./support/TargetCase2ModelCreator";

const testType = "targetCase2";
const modelCreator = new TargetCase2ModelCreator();

test('Test SHACL against data - target case #2 POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - target case #2 ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

