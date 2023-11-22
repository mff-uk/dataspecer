import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";

const testType = "simpleObjectNegative";
const modelCreator = new SimpleObjectModelCreator();

test.skip('Test SHACL against data - simple object NEGATIVE', async () => {
  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);

  /*
  await Support.prepareShape(new SimpleObjectModelCreator(), '../shapes/simpleObjectShape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/simpleObjectShapeNegative-data.ttl", "src/tests/shapes/simpleObjectShape.ttl");
  expect(validation.conforms).toBe(false);
  */

});

