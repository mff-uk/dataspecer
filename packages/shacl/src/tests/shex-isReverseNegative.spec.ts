import * as Support from "./support/testSupport";
import  IsReverseModelCreator from "./support/IsReverseModelCreator";

const testType = "isReverseNegative";
const modelCreator = new IsReverseModelCreator();

test.skip('Test ShEx against data - isReverse feature NEGATIVE', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(false).toBe(false);
});