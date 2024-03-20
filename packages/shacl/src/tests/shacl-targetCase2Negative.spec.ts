import * as Support from "./support/testSupport";
import TargetCase2ModelCreator from "./support/TargetCase2ModelCreator";
import * as fs from "fs";


const testType = "targetCase2Negative";
const modelCreator = new TargetCase2ModelCreator();

test('Test SHACL against data - target case #2 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
  const shape = await fs.readFileSync("src/tests/shapes/" + testType.substring(0,11) + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:targetSubjectsOf <https://slovník.gov.cz/generický/adresy/pojem/prvek-rúian>;")
});

