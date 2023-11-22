import * as Support from "./support/testSupport";
import ClassConstrainedClosedModelCreator from "./support/ClassConstrainedClosedModelCreator";

const testType = "classConstrainedClosedNegative";
const modelCreator = new ClassConstrainedClosedModelCreator();

test.skip('Test SHACL against data - class constrained closed shape NEGATIVE', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
/*
  await Support.prepareShape(new ClassConstrainedClosedShapeModelCreator(), '../shapes/classConstrainedClosedShape.ttl');
  const validation = await Support.validateDataAgainstShape('src/tests/data/classConstrainedClosedShapeNegative-data.ttl', 'src/tests/shapes/classConstrainedClosedShape.ttl');
  expect(validation.conforms).toBe(false);
  */

});

