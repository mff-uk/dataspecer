import * as Support from "./support/testSupport";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator";


const testType = "targetCase4";
const modelCreator = new TargetCase4ModelCreator();

test('Shape conforms to SxEx standard - targetCase4', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});

