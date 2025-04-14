import * as Support from "./support/testSupport.ts";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator.ts";

const testType = "allPrimitiveDatatypes";
const modelCreator = new AllPrimitiveTypesModelCreator();

test('Test SHACL against data - all primitive types POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - all primitive types', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

