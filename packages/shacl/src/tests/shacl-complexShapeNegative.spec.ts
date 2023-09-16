import * as Support from "./support/testSupport";
import ClosedShapeModelCreator from "./support/ComplexShapeModelCreator";


test('Test SHACL against data - complex shape NEGATIVE ', async () => {

  await Support.prepareShape(new ClosedShapeModelCreator(), '../shapes/complexShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/complexShapeNegative-data.ttl', 'src/tests/shapes/complexShape.ttl');
  expect(validation.conforms).toBe(false);

});
