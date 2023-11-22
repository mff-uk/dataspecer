import * as Support from "./support/testSupport";
import ClosedModelCreator from "./support/ClosedModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "closed";
const modelCreator = new ClosedModelCreator();

test('Test SHACL against data - closed shape POSITIVE ', async () => {
  /*
  const validation = await Support.testPositive(testType, modelCreator);
   expect(validation.conforms).toBe(true);
 */
  await Support.prepareShape(new ClosedModelCreator(), '../shapes/closedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/closedShapePositive-data.ttl', 'src/tests/shapes/closedShape.ttl');
  expect(validation.conforms).toBe(true);

});


test('Shape conforms to SHACL standard - closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
/*
  await Support.prepareShape(new ClosedShapeModelCreator(), '../shapes/closedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/closedShape.ttl", "src/tests/shapes/shapeToValidateShapes.ttl");
  expect(validation.conforms).toBe(true);
 */
});
