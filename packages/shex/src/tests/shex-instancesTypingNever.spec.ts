import * as Support from "./support/testSupport.ts";
import  NeverModelCreator from "./support/NeverModelCreator.ts";
import * as fs from "fs";

const testType = "instancesTypingNever";
const modelCreator = new NeverModelCreator();

test('Shape conforms to SxEx standard - instancesTypingNever syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("a . {0} ;");
});