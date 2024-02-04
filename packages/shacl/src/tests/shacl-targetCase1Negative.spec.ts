import * as Support from "./support/testSupport";
import TargetCase1ModelCreator from "./support/TargetCase1ModelCreator";

const testType = "targetCase1Negative";
const modelCreator = new TargetCase1ModelCreator();

test('Test SHACL against data - target case #1 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

