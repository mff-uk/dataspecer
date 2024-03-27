import * as Support from "./support/testSupport";
import MultipurposeModelCreator from "./support/MultipurposeModelCreator";
import * as fs from "fs";


const testType = "instancesIdentificationAlways";
const modelCreator = new MultipurposeModelCreator();

test('Test SHACL against data - instancesIdentificationAlways in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:nodeKind sh:IRI")
});