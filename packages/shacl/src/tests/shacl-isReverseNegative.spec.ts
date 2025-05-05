import * as Support from "./support/testSupport.ts";
import  IsReverseModelCreator from "./support/IsReverseModelCreator.ts";

const testType = "isReverseNegative";
const modelCreator = new IsReverseModelCreator();

test('Test SHACL against data - isReverse NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});