import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "maxMinCardinalityNegative";
const modelCreator = new MaxMinCardinalityModelCreator();

test.skip('Test SHACL against data - cardinality NEGATIVE ', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
/*
  await Support.prepareShape(new MaxMinCardinalityModelCreator(), '../shapes/maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/maxMinCardinalityShapeNegative-data.ttl","src/tests/shapes/maxMinCardinalityShape.ttl");
  expect(validation.conforms).toBe(false);
 */
});
