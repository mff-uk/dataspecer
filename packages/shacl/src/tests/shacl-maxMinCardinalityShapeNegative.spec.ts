import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";

test('Test SHACL against data - cardinality NEGATIVE ', async () => {

  await Support.prepareShape(new MaxMinCardinalityModelCreator(), '../shapes/maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/maxMinCardinalityShapeNegative-data.ttl","src/tests/shapes/maxMinCardinalityShape.ttl");
  expect(validation.conforms).toBe(false);

});
