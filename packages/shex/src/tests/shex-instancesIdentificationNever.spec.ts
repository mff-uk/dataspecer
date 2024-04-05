import * as Support from "./support/testSupport";
import  NeverModelCreator from "./support/NeverModelCreator";
import * as fs from "fs";

const testType = "instancesIdentificationNever";
const modelCreator = new NeverModelCreator();

test('Shape conforms to SxEx standard - instancesIdentificationNever syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("<bfe55dedc512e9e184b5194b632c1c03Technickýpopisekclass1ShExShape> BNode{");
});