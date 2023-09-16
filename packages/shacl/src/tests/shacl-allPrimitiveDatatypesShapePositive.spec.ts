import * as Support from "./support/testSupport";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator";

test('Test SHACL against data - all primitive types POSITIVE ', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), '../shapes/allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/allPrimitiveDatatypesShapePositive-data.ttl", "src/tests/shapes/allPrimitiveDatatypesShape.ttl");
  expect(validation.conforms).toBe(true);

});

test('Shape conforms to SHACL standard - all primitive types', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), '../shapes/allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/allPrimitiveDatatypesShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);

});

