import * as Support from "./support/testSupport";
import NestedClosedShapeModelCreator from "./support/NestedClosedModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "nestedClosedNegative";
const modelCreator = new NestedClosedShapeModelCreator();

test.skip('Test SHACL against data - nested closed shape NEGATIVE', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
/*
  await Support.prepareShape(new NestedClosedShapeModelCreator(), '../shapes/nestedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/nestedClosedShapeNegative-data.ttl', 'src/tests/shapes/nestedClosedShape.ttl');
  expect(validation.conforms).toBe(false);
 */
});

