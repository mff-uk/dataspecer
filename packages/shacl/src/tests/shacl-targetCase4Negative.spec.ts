import * as Support from "./support/testSupport";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator";

const testType = "targetCase4Negative";
const modelCreator = new TargetCase4ModelCreator();

test('Test SHACL against data - target case #4 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

