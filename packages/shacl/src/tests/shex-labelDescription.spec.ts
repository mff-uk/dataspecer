import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";
import * as fs from "fs";

const testType = "labelDescription";
const modelCreator = new SimpleObjectModelCreator();

test('Shape conforms to SxEx standard - labelDescription syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("// rdfs:label	\"Číslo popisné\"");
  expect(shape).toContain("// rdfs:comment	\"Číslo popisné dané budovy\"");
});