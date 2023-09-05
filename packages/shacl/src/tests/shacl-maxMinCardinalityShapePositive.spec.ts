import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";

test('Test SHACL against data - cardinality POSITIVE ', async () => {

  await Support.prepareShape(new MaxMinCardinalityModelCreator(), '../shapes/maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/maxMinCardinalityShapePositive-data.ttl", "src/tests/shapes/maxMinCardinalityShape.ttl");
  expect(validation).toBe(true);

});

test('Shape conforms to SHACL standard - cardinality shape', async () => {

  await Support.prepareShape(new MaxMinCardinalityModelCreator(), '../shapes/maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/maxMinCardinalityShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
