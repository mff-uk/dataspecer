import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObject";
const modelCreator = new SimpleObjectModelCreator();

test.skip('Test SHACL against data - simple object POSITIVE', async () => {
  const validation = await Support.testPositive(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test.skip('Shape conforms to SHACL standard - simple object', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
