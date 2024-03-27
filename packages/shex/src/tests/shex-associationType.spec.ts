import * as Support from "./support/testSupport";
import  TargetCase4ModelCreator from "./support/TargetCase4ModelCreator";
import * as fs from "fs";

const testType = "";
const modelCreator = new TargetCase4ModelCreator();

test('Shape conforms to SxEx standard - associationType syntax', async () => {

  await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("a [<https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/území-městského-obvodu-v-hlavním-městě-praze>]");
});