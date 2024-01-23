import * as Support from "./support/testSupport";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator";

const testType = "allPrimitiveDatatypes";
const modelCreator = new AllPrimitiveTypesModelCreator();

test.skip('Test SHACL against data - all primitive types POSITIVE ', async () => {
  await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/" + testType + "FakeDataTurtle.ttl", "src/tests/shapes/" + testType + "Shape.ttl");
  expect(validation.conforms).toBe(true);
});

test('Shape conforms to SHACL standard - all primitive types', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

