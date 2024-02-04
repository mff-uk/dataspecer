import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObjectNegative";
const modelCreator = new SimpleObjectModelCreator();

test.skip('Test SHACL against data - simple object NEGATIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

