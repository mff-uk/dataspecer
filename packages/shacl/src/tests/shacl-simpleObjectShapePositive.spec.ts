import * as Support from "./testSupport";
import  SimpleObjectModelCreator from "./SimpleObjectModelCreator";

test('Test SHACL against data - simple object POSITIVE', async () => {

  await Support.prepareShape(new SimpleObjectModelCreator(), './simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/simpleObjectShapePositive-data.ttl", "src/tests/simpleObjectShape.ttl");
  expect(validation).toBe(true);

});

test('Shape conforms to SHACL standard - simple object', async () => {

  await Support.prepareShape(new SimpleObjectModelCreator(), './simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/simpleObjectShape.ttl", "src/tests/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
