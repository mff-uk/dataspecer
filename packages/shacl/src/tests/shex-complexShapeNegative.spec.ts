import * as Support from "./support/testSupport";
import ComplexModelCreator from "./support/ComplexModelCreator";

const testType = "complexNegative";
const modelCreator = new ComplexModelCreator();

test('Shape conforms to SxEx standard - complexNegative', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("nonconformant");
});
