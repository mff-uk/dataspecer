import * as Support from "./support/testSupport";
import ClassConstrainedClosedShapeModelCreator from "./support/ClassConstrainedClosedShapeModelCreator";


test('Test SHACL against data - class constrained closed shape NEGATIVE', async () => {

  await Support.prepareShape(new ClassConstrainedClosedShapeModelCreator(), '../shapes/classConstrainedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/classConstrainedClosedShapeNegative-data.ttl', 'src/tests/shapes/classConstrainedClosedShape.ttl');
  expect(validation.conforms).toBe(false);

});

