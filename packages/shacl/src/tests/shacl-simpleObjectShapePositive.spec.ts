import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObject";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - simple object POSITIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - simple object', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
