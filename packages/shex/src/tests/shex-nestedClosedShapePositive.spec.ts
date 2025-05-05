import * as Support from "./support/testSupport.ts";
import NestedClosedModelCreator from "./support/NestedClosedModelCreator.ts";

const testType = "nestedClosed";
const modelCreator = new NestedClosedModelCreator();

test('Shape conforms to SxEx standard - nestedClosed', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});
