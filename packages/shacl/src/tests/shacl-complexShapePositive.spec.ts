import * as Support from "./support/testSupport";
import ComplexShapeModelCreator from "./support/ComplexShapeModelCreator";


test('Test SHACL against data - complex shape POSITIVE ', async () => {

  await Support.prepareShape(new ComplexShapeModelCreator(), '../shapes/complexShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/complexShapePositive-data.ttl', 'src/tests/shapes/complexShape.ttl');
  expect(validation.conforms).toBe(true);

});


test('Shape conforms to SHACL standard - complex shape ', async () => {

  await Support.prepareShape(new ComplexShapeModelCreator(), '../shapes/complexShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/complexShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);

});