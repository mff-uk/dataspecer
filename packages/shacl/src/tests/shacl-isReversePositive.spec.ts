import * as Support from "./support/testSupport";
import  IsReverse from "./support/IsReverseModelCreator";

const testType = "isReverse";
const modelCreator = new IsReverse();

test('Test SHACL against data - isReverse Positive ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - isReverse shape', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});