import * as Support from "./support/testSupport.ts";
import ComplexModelCreator from "./support/ComplexModelCreator.ts";

const testType = "complex";
const modelCreator = new ComplexModelCreator();

test('Shape conforms to SxEx standard - complex', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});