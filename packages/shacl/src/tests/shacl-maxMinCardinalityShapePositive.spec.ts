import * as Support from "./testSupport";
import  MaxMinCardinalityModelCreator from "./MaxMinCardinalityModelCreator";

test('Test SHACL against data - cardinality POSITIVE ', async () => {

  await Support.prepareShape(new MaxMinCardinalityModelCreator(), './maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/maxMinCardinalityShapePositive-data.ttl", "src/tests/maxMinCardinalityShape.ttl");
  expect(validation).toBe(true);

});

test('Shape conforms to SHACL standard - cardinality shape', async () => {

  await Support.prepareShape(new MaxMinCardinalityModelCreator(), './maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/maxMinCardinalityShape.ttl", "src/tests/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
