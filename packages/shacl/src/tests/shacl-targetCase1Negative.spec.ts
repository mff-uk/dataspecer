import * as Support from "./support/testSupport";
import TargetCase1ModelCreator from "./support/TargetCase1ModelCreator";
import * as fs from "fs";


const testType = "targetCase1Negative";
const modelCreator = new TargetCase1ModelCreator();

test('Test SHACL against data - target case #1 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
  const shape = await fs.readFileSync("src/tests/shapes/" + testType.substring(0,11) + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:targetClass <https://slovník.gov.cz/legislativní/sbírka/111/2009/pojem/adresa>")
});

