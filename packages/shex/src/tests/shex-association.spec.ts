import * as Support from "./support/testSupport.ts";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";
import * as fs from "fs";

const testType = "association";
const modelCreator = new SimpleObjectModelCreator();

test('Shape conforms to SxEx standard - association syntax', async () => {

  //const validationReportStatus = Support.testShexShape(testType, modelCreator);
  //const shexTester = new Support.TestResults();
  await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("@<cb7b59f426ab7ddeb06a5fac76e9e517uzemi-mestskeho-obvoduShExShape> +");
});