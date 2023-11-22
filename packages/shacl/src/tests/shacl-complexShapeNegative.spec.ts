import * as Support from "./support/testSupport";
import ComplexModelCreator from "./support/ComplexModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "complexNegative";
const modelCreator = new ComplexModelCreator();

test.skip('Test SHACL against data - complex shape NEGATIVE ', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
/*
  await Support.prepareShape(new ClosedShapeModelCreator(), '../shapes/complexShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/complexShapeNegative-data.ttl', 'src/tests/shapes/complexShape.ttl');
  expect(validation.conforms).toBe(false);
 */
});
