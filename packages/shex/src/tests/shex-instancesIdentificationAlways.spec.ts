import * as Support from "./support/testSupport";
import  MultipurposeModelCreator from "./support/MultipurposeModelCreator";
import * as fs from "fs";

const testType = "instancesIdentificationAlways";
const modelCreator = new MultipurposeModelCreator();

test('Shape conforms to SxEx standard - instancesIdentificationAlways in syntax', async () => {

    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("<bfe55dedc512e9e184b5194b632c1c03Technickýpopisekclass1ShExShape> IRI{");
});