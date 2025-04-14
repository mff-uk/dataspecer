import * as Support from "./support/testSupport.ts";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator.ts";
import * as fs from "fs";


const testType = "associationType";
const modelCreator = new TargetCase4ModelCreator();

test('Test SHACL against data - associationType in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:class <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/území-městského-obvodu-v-hlavním-městě-praze>;")
});