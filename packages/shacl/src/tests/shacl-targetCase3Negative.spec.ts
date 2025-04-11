import * as Support from "./support/testSupport";
import TargetCase3ModelCreator from "./support/TargetCase3ModelCreator";
import * as fs from "fs";


const testType = "targetCase3Negative";
const modelCreator = new TargetCase3ModelCreator();

test('Test SHACL against data - target case #3 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:targetClass <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/území-městského-obvodu-v-hlavním-městě-praze>")
});

