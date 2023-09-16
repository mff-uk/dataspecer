import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

test('Test SHACL against data - simple object NEGATIVE', async () => {

  await Support.prepareShape(new SimpleObjectModelCreator(), '../shapes/simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/simpleObjectShapeNegative-data.ttl", "src/tests/shapes/simpleObjectShape.ttl");
  expect(validation.conforms).toBe(false);

});

test('Shape conforms to SHACL standard - simple object', async () => {
  
  await Support.prepareShape(new SimpleObjectModelCreator(), '../shapes/simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/simpleObjectShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);

});
