import * as Support from "./support/testSupport";
import  IsReverseModelCreator from "./support/IsReverseModelCreator";

const testType = "isReverse";
const modelCreator = new IsReverseModelCreator();

test('Shape conforms to SxEx standard - isReverse', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});