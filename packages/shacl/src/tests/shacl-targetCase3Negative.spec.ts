import * as Support from "./support/testSupport";
import TargetCase3ModelCreator from "./support/TargetCase3ModelCreator";

const testType = "targetCase3Negative";
const modelCreator = new TargetCase3ModelCreator();

test('Test SHACL against data - target case #3 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

