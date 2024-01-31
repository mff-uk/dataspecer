import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObject";
const modelCreator = new SimpleObjectModelCreator();

test.skip('Test ShEx against data - simple object POSITIVE', async () => {
  const validation = await Support.testPositive(testType, modelCreator);
  expect(true).toBe(true);
});

test.skip('Shape conforms to ShEx standard - simple object', async () => {
  const validation = await Support.testShexShape(testType, modelCreator);
  expect(true).toBe(true);
});