import * as Support from "./support/testSupport";
import NestedClosedShapeModelCreator from "./support/NestedClosedShapeModelCreator";


test('Test SHACL against data - nested closed shape POSITIVE ', async () => {

  await Support.prepareShape(new NestedClosedShapeModelCreator(), '../shapes/nestedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/nestedClosedShapePositive-data.ttl', 'src/tests/shapes/nestedClosedShape.ttl');
  expect(validation).toBe(true);

});


test('Shape conforms to SHACL standard - nested closed shape ', async () => {

  await Support.prepareShape(new NestedClosedShapeModelCreator(), '../shapes/nestedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/nestedClosedShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
