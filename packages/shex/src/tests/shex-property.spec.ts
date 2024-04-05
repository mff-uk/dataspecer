import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";
import * as fs from "fs";

const testType = "property";
const modelCreator = new SimpleObjectModelCreator();

test('Shape conforms to SxEx standard - property syntax', async () => {
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  const shape = await fs.readFileSync("src/tests/shexShapes/" + testType + "Shape.shex",
  { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("<https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/název-městského-obvodu-v-hlavním-městě-praze> xsd:string +");
});