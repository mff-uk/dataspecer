import * as Support from "./support/testSupport";
import ClosedModelCreator from "./support/ClosedModelCreator";

const testType = "closed";
const modelCreator = new ClosedModelCreator();

test.skip('Test SHACL against data - closed shape POSITIVE ', async () => {
  await Support.prepareShape(new ClosedModelCreator(), '../shapes/closedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/closedShapePositive-data.ttl', 'src/tests/shapes/closedShape.ttl');
  expect(validation.conforms).toBe(true);
});


test('Shape conforms to SHACL standard - closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
