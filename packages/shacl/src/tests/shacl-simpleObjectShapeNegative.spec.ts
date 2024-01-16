import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObjectNegative";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - simple object NEGATIVE', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

