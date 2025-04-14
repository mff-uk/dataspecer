import * as Support from "./support/testSupport.ts";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";

const testType = "simpleObject";
const modelCreator = new SimpleObjectModelCreator();

test('Shape conforms to SxEx standard - simple object', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  const shexTester = new Support.TestResults();
  const report = await shexTester.testShexShape(testType, modelCreator);
  const parsed = JSON.parse(report.toString());
  //console.log(report);
  expect(parsed[0].status).toBe("conformant");
});