import * as Support from "./testSupport";
import  MaxMinCardinalityModelCreator from "./MaxMinCardinalityModelCreator";

test('Test SHACL against data - cardinality NEGATIVE ', async () => {

  await Support.prepareShape(new MaxMinCardinalityModelCreator(), './maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/maxMinCardinalityShapeNegative-data.ttl","src/tests/maxMinCardinalityShape.ttl");
  expect(validation).toBe(false);

});
