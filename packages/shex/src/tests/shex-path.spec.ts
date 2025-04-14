import * as Support from "./support/testSupport.ts";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";
import * as fs from "fs";

const testType = "path";
const modelCreator = new SimpleObjectModelCreator();

test('Shape conforms to SxEx standard - path syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("<https://slovník.gov.cz/generický/adresy/pojem/prvek-rúian> IRI");
});