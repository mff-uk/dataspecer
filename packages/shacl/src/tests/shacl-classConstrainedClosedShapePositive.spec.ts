import * as Support from "./support/testSupport.ts";
import ClassConstrainedClosedModelCreator from "./support/ClassConstrainedClosedModelCreator.ts";

const testType = "classConstrainedClosed";
const modelCreator = new ClassConstrainedClosedModelCreator();

test('Test SHACL against data - class constrained closed shape POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});


test('Shape conforms to SHACL standard - class constrained closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
