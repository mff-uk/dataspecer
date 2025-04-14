import * as Support from "./support/testSupport.ts";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator.ts";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator.ts";

const testType = "allPrimitiveDatatypesNegative";
const modelCreator = new AllPrimitiveTypesModelCreator();

test('Test SHACL against data - all primitive types NEGATIVE', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
