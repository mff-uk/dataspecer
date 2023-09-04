import * as Support from "./testSupport";
import AllPrimitiveTypesModelCreator from "./AllPrimitiveTypesModelCreator";

test('Test SHACL against data - all primitive types NEGATIVE', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), './allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/allPrimitiveDatatypesShapeNegative-data.ttl", "src/tests/allPrimitiveDatatypesShape.ttl");
  expect(validation).toBe(false);
  
});

test('Shape conforms to SHACL standard - all primitive types', async () => {

  await Support.prepareShape(new AllPrimitiveTypesModelCreator(), './allPrimitiveDatatypesShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/allPrimitiveDatatypesShape.ttl", "src/tests/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
