import * as Support from "./support/testSupport";
import TargetCase2ModelCreator from "./support/TargetCase2ModelCreator";

const testType = "targetCase2Negative";
const modelCreator = new TargetCase2ModelCreator();

test('Test SHACL against data - target case #2 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

