import * as Support from "./support/testSupport.ts";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator.ts";
import * as fs from "fs";


const testType = "targetCase4Negative";
const modelCreator = new TargetCase4ModelCreator();

test('Test SHACL against data - target case #4 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:targetSubjectsOf <http://www.example.org/unikatniPredikat>")
});

