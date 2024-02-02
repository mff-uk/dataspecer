import * as Support from "./support/testSupport";
import ComplexModelCreator from "./support/ComplexModelCreator";

const testType = "complex";
const modelCreator = new ComplexModelCreator();

test.skip('Test SHACL against data - complex shape POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);

});


test('Shape conforms to SHACL standard - complex shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});