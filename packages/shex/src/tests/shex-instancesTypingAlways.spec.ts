import * as Support from "./support/testSupport";
import  MultipurposeModelCreator from "./support/MultipurposeModelCreator";
import * as fs from "fs";

const testType = "instancesTypingAlways";
const modelCreator = new MultipurposeModelCreator();

test('Shape conforms to SxEx standard - instancesTypingAlways syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("a [<https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/adresa>] ");
});