import * as Support from "./support/testSupport";
import NestedClosedShapeModelCreator from "./support/NestedClosedShapeModelCreator";


test('Test SHACL against data - nested closed shape NEGATIVE', async () => {

  await Support.prepareShape(new NestedClosedShapeModelCreator(), '../shapes/nestedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/nestedClosedShapeNegative-data.ttl', 'src/tests/shapes/nestedClosedShape.ttl');
  expect(validation).toBe(false);

});

