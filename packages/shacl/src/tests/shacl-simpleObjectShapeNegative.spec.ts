import * as Support from "./support/testSupport.ts";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";

const testType = "simpleObjectNegative";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - simple object NEGATIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

