import * as Support from "./support/testSupport";
import TargetCase1ModelCreator from "./support/TargetCase1ModelCreator";
import * as fs from "fs";

const testType = "targetCase1";
const modelCreator = new TargetCase1ModelCreator();

test('Shape conforms to SxEx standard - targetCase1', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});

