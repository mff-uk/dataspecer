import * as Support from "./support/testSupport.ts";
import ClassConstrainedClosedModelCreator from "./support/ClassConstrainedClosedModelCreator.ts";

const testType = "classConstrainedClosedNegative";
const modelCreator = new ClassConstrainedClosedModelCreator();

test('Test SHACL against data - class constrained closed shape NEGATIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});

