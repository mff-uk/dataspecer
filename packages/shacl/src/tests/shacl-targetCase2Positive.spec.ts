import * as Support from "./support/testSupport";
import TargetCase2ModelCreator from "./support/TargetCase2ModelCreator";
import * as fs from "fs";


const testType = "targetCase2";
const modelCreator = new TargetCase2ModelCreator();

test('Test SHACL against data - target case #2 POSITIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(true);
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:targetSubjectsOf <https://slovník.gov.cz/generický/adresy/pojem/prvek-rúian>;")
});

test('Shape conforms to SHACL standard - target case #2 ', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});

