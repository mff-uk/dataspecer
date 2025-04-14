import * as Support from "./support/testSupport.ts";
import  IsReverse from "./support/IsReverseModelCreator.ts";

const testType = "isReverseNegative";
const modelCreator = new IsReverse();

test('Shape conforms to SxEx standard - isReverseNegative', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("nonconformant");
});