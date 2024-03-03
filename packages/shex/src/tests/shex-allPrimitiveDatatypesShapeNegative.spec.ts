import * as Support from "./support/testSupport";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator";

const testType = "allPrimitiveDatatypesNegative";
const modelCreator = new AllPrimitiveTypesModelCreator();

test('Shape conforms to SxEx standard - allPrimitiveDatatypesNegative object', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("nonconformant");
});
