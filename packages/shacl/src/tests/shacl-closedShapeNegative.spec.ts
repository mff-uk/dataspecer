import * as Support from "./support/testSupport";
import ClosedShapeModelCreator from "./support/ClosedShapeModelCreator";

test('Test SHACL against data - closed shape NEGATIVE  ', async () => {

  await Support.prepareShape(new ClosedShapeModelCreator(), '../shapes/closedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/closedShapeNegative-data.ttl","src/tests/shapes/closedShape.ttl");
  expect(validation).toBe(false);

});


test('Shape conforms to SHACL standard - closed shape ', async () => {

  await Support.prepareShape(new ClosedShapeModelCreator(), '../shapes/closedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/closedShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
