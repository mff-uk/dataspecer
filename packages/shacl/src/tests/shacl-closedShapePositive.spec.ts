import * as Support from "./testSupport";
import ClosedShapeModelCreator from "./ClosedShapeModelCreator";

test('Test SHACL against data - closed shape POSITIVE ', async () => {

  await Support.prepareShape(new ClosedShapeModelCreator(), './closedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/closedShapePositive-data.ttl', 'src/tests/closedShapePositive.ttl');
  expect(validation).toBe(true);

});

test('Shape conforms to SHACL standard - closed shape ', async () => {

  await Support.prepareShape(new ClosedShapeModelCreator(), './closedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/closedShapePositive.ttl", "src/tests/shapeToValidateShapes.ttl");
  expect(validation).toBe(true);

});
