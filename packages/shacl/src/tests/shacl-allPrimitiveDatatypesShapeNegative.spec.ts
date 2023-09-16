import * as Support from "./support/testSupport";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator";

test('Test SHACL against data - all primitive types NEGATIVE', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), '../shapes/allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/allPrimitiveDatatypesShapeNegative-data.ttl", "src/tests/shapes/allPrimitiveDatatypesShape.ttl");
  expect(validation.conforms).toBe(false);
  
});

test('Shape conforms to SHACL standard - all primitive types', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), '../shapes/allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/allPrimitiveDatatypesShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);

});
