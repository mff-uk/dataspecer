import * as Support from "./support/testSupport";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator";

const testType = "targetCase4";
const modelCreator = new TargetCase4ModelCreator();

test('Test SHACL against data - target case #4 POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - target case #4 ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

