import * as Support from "./support/testSupport";
import ClassConstrainedClosedShapeModelCreator from "./support/ClassConstrainedClosedShapeModelCreator";


test('Test SHACL against data - class constrained closed shape POSITIVE ', async () => {

  await Support.prepareShape(new ClassConstrainedClosedShapeModelCreator(), '../shapes/classConstrainedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/classConstrainedClosedShapePositive-data.ttl', 'src/tests/shapes/classConstrainedClosedShape.ttl');
  expect(validation.conforms).toBe(true);

});


test('Shape conforms to SHACL standard - class constrained closed shape ', async () => {

  await Support.prepareShape(new ClassConstrainedClosedShapeModelCreator(), '../shapes/classConstrainedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/classConstrainedClosedShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);

});
