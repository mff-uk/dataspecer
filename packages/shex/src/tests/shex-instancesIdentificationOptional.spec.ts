import * as Support from "./support/testSupport.ts";
import  OptionalModelCreator from "./support/OptionalModelCreator.ts";
import * as fs from "fs";

const testType = "instancesIdentificationOptional";
const modelCreator = new OptionalModelCreator();

test('Shape conforms to SxEx standard - instancesIdentificationOptional', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("<bfe55dedc512e9e184b5194b632c1c03Technickýpopisekclass1ShExShape> NonLiteral{");
});