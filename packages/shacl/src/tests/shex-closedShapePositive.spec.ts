import * as Support from "./support/testSupport";
import ClosedModelCreator from "./support/ClosedModelCreator";

const testType = "closed";
const modelCreator = new ClosedModelCreator();

test('Shape conforms to SxEx standard - closed object', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});
