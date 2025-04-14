import * as Support from "./support/testSupport.ts";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator.ts";

const testType = "maxMinCardinality";
const modelCreator = new MaxMinCardinalityModelCreator();

test('Shape conforms to SxEx standard - maxMinCardinality', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("conformant");
});
