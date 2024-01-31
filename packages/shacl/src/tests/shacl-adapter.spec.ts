import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator";
import * as Support from "./support/testSupport";

const testType = "allPrimitiveDatatypesNegative";
const modelCreator = new AllPrimitiveTypesModelCreator();

test.skip('Test SHACL ', async () => {
  const validation = await Support.testPositive(testType, modelCreator); expect(validation.conforms).toBe(true);
});

