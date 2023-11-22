import * as Support from "./support/testSupport";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "maxMinCardinality";
const modelCreator = new MaxMinCardinalityModelCreator();

test.skip('Test SHACL against data - cardinality POSITIVE ', async () => {
  const validation = await Support.testPositive(testType, modelCreator);
  expect(validation.conforms).toBe(true);
/*
  await Support.prepareShape(new MaxMinCardinalityModelCreator(), '../shapes/maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/maxMinCardinalityShapePositive-data.ttl", "src/tests/shapes/maxMinCardinalityShape.ttl");
  expect(validation.conforms).toBe(true);
 */
});

test('Shape conforms to SHACL standard - cardinality shape', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
/*
  await Support.prepareShape(new MaxMinCardinalityModelCreator(), '../shapes/maxMinCardinalityShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/maxMinCardinalityShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);
 */
});
