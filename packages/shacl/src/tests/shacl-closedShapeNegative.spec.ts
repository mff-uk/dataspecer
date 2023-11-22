import * as Support from "./support/testSupport";
import ClosedModelCreator from "./support/ClosedModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "closedNegative";
const modelCreator = new ClosedModelCreator();

test.skip('Test SHACL against data - closed shape NEGATIVE  ', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
/*
  await Support.prepareShape(new ClosedShapeModelCreator(), '../shapes/closedShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/closedShapeNegative-data.ttl","src/tests/shapes/closedShape.ttl");
  expect(validation.conforms).toBe(false);
 */
});
