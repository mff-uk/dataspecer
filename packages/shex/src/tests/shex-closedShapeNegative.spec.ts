import * as Support from "./support/testSupport.ts";
import ClosedModelCreator from "./support/ClosedModelCreator.ts";

const testType = "closedNegative";
const modelCreator = new ClosedModelCreator();

test('Shape conforms to SxEx standard - closedNegative object', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("nonconformant");
});
