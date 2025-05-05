import * as Support from "./support/testSupport.ts";
import TargetCase3ModelCreator from "./support/TargetCase3ModelCreator.ts";


const testType = "targetCase3";
const modelCreator = new TargetCase3ModelCreator();

test('Shape conforms to SxEx standard - targetCase3', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});
