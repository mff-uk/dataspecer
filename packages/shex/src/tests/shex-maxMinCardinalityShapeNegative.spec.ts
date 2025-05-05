import * as Support from "./support/testSupport.ts";
import  MaxMinCardinalityModelCreator from "./support/MaxMinCardinalityModelCreator.ts";

const testType = "maxMinCardinalityNegative";
const modelCreator = new MaxMinCardinalityModelCreator();

test('Shape conforms to SxEx standard - maxMinCardinalityNegative', async () => {

  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  expect(parsed[0].status).toBe("nonconformant");
});
