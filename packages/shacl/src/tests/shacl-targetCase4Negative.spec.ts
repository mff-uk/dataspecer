import * as Support from "./support/testSupport";
import TargetCase4ModelCreator from "./support/TargetCase4ModelCreator";
import * as fs from "fs";


const testType = "targetCase4Negative";
const modelCreator = new TargetCase4ModelCreator();

test('Test SHACL against data - target case #4 NEGATIVE ', async () => {
  const validation = await Support.testFromData(testType, modelCreator);
  expect(validation.conforms).toBe(false);
  const shape = await fs.readFileSync("src/tests/shapes/" + testType.substring(0,11) + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:targetSubjectsOf <http://www.example.org/unikatniPredikat>")
});

