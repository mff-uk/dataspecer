import * as Support from "./support/testSupport";
import TargetCase5ModelCreator from "./support/TargetCase5ModelCreator";

const testType = "targetCase5";
const modelCreator = new TargetCase5ModelCreator();

test.skip('Test SHACL against data - target case #5 POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test.skip('Shape conforms to SHACL standard - target case #5 ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

