import * as Support from "./support/testSupport";
import TargetCase2ModelCreator from "./support/TargetCase2ModelCreator";
import * as fs from "fs";


const testType = "targetCase2";
const modelCreator = new TargetCase2ModelCreator();

test('Shape conforms to SxEx standard - targetCase2', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});

