import * as Support from "./support/testSupport";
import TargetCase5ModelCreator from "./support/TargetCase5ModelCreator";

const testType = "targetCase5Negative";
const modelCreator = new TargetCase5ModelCreator();

test.skip('Test SHACL against data - target case #5 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

