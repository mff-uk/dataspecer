import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObject";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - simple object POSITIVE', async () => {
  const validation = await Support.testPositive(testType, modelCreator);
  expect(validation.conforms).toBe(true);
  /*
  await Support.prepareShape(new SimpleObjectModelCreator(), '../shapes/simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/simpleObjectShapePositive-data.ttl", "src/tests/shapes/simpleObjectShape.ttl");
  expect(validation.conforms).toBe(true);
  */

});

test('Shape conforms to SHACL standard - simple object', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);

  /*
  await Support.prepareShape(new SimpleObjectModelCreator(), '../shapes/simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/simpleObjectShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);
  */

});
