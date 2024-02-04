import * as Support from "./support/testSupport";
import ClassConstrainedClosedModelCreator from "./support/ClassConstrainedClosedModelCreator";

const testType = "classConstrainedClosed";
const modelCreator = new ClassConstrainedClosedModelCreator();

test.skip('Test SHACL against data - class constrained closed shape POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});


test.skip('Shape conforms to SHACL standard - class constrained closed shape ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});
