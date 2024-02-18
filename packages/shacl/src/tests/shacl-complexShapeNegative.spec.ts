import * as Support from "./support/testSupport";
import ComplexModelCreator from "./support/ComplexModelCreator";

const testType = "complexNegative";
const modelCreator = new ComplexModelCreator();

test('Test SHACL against data - complex shape NEGATIVE ', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
