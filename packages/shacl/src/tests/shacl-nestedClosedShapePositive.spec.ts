import * as Support from "./support/testSupport";
import NestedClosedModelCreator from "./support/NestedClosedModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "nestedClosed";
const modelCreator = new NestedClosedModelCreator();

test('Test SHACL against data - nested closed shape POSITIVE ', async () => {
  const validation = await Support.testPositive(testType, modelCreator);
  expect(validation.conforms).toBe(true);
  /*
  await Support.prepareShape(new NestedClosedModelCreator(), '../shapes/nestedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/nestedClosedShapePositive-data.ttl', 'src/tests/shapes/nestedClosedShape.ttl');
  expect(validation.conforms).toBe(true);
  */

});


test('Shape conforms to SHACL standard - nested closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);

  /*
  await Support.prepareShape(new NestedClosedModelCreator(), '../shapes/nestedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/nestedClosedShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);
  */

});
