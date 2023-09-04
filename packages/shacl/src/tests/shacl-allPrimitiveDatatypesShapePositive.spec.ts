import * as Support from "./testSupport";
import AllPrimitiveTypesModelCreator from "./AllPrimitiveTypesModelCreator";

test('Test SHACL against data - all primitive types POSITIVE ', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), './allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/allPrimitiveDatatypesShapePositive-data.ttl", "src/tests/allPrimitiveDatatypesShape.ttl");
  expect(validation).toBe(true);

});

test('Shape conforms to SHACL standard - all primitive types', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), './allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/allPrimitiveDatatypesShape.ttl", "src/tests/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});

