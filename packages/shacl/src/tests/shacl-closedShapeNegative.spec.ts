import * as Support from "./testSupport";
import ClosedShapeModelCreator from "./ClosedShapeModelCreator";

test('Test SHACL against data - closed shape NEGATIVE  ', async () => {

  await Support.prepareShape(new ClosedShapeModelCreator(), './closedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/closedShapeNegative-data.ttl","src/tests/closedShape.ttl");
  expect(validation).toBe(false);

});
