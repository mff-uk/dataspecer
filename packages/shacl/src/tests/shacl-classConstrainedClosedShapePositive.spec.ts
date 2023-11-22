import * as Support from "./support/testSupport";
import ClassConstrainedClosedModelCreator from "./support/ClassConstrainedClosedModelCreator";

const testType = "classConstrainedClosed";
const modelCreator = new ClassConstrainedClosedModelCreator();

test.skip('Test SHACL against data - class constrained closed shape POSITIVE ', async () => {
  const validation = await Support.testPositive(testType, modelCreator);
  expect(validation.conforms).toBe(true);
  /*
  await Support.prepareShape(new ClassConstrainedClosedShapeModelCreator(), '../shapes/classConstrainedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/classConstrainedClosedShapePositive-data.ttl', 'src/tests/shapes/classConstrainedClosedShape.ttl');
  expect(validation.conforms).toBe(true);
  */

});


test('Shape conforms to SHACL standard - class constrained closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
/*
  await Support.prepareShape(new ClassConstrainedClosedShapeModelCreator(), '../shapes/classConstrainedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/classConstrainedClosedShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);
 */
});
