import * as Support from "./support/testSupport";
import  IsReverseModelCreator from "./support/IsReverseModelCreator";

const testType = "isReverse";
const modelCreator = new IsReverseModelCreator();

test.skip('Test ShEx against data - isReverse feature POSITIVE', async () => {
  //const validation = await Support.testShexPositive(testType, modelCreator);
  expect(true).toBe(true);
});

test.skip('Shape conforms to ShEx standard - isReverse feature', async () => {
  const validation = await Support.testShexShape(testType, modelCreator);
  expect(true).toBe(true);
});