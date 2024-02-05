import * as Support from "./support/testSupport";
import  IsReverse from "./support/IsReverseModelCreator";

const testType = "isReverseNegative";
const modelCreator = new IsReverse();

test('Test SHACL against data - isReverse NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});