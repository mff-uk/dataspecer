import * as Support from "./support/testSupport.ts";
import NestedClosedShapeModelCreator from "./support/NestedClosedModelCreator.ts";

const testType = "nestedClosedNegative";
const modelCreator = new NestedClosedShapeModelCreator();

test('Shape conforms to SxEx standard - nestedClosedNegative', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("nonconformant");
});

