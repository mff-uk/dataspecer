import * as Support from "./support/testSupport.ts";
import MultipurposeModelCreator from "./support/MultipurposeModelCreator.ts";
import * as fs from "fs";


const testType = "instancesTypingAlways";
const modelCreator = new MultipurposeModelCreator();

test('Test SHACL against data -  in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:class <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/adresa>;")
});