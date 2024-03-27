import * as Support from "./support/testSupport";
import NeverModelCreator from "./support/NeverModelCreator";
import * as fs from "fs";


const testType = "instancesIdentificationNever";
const modelCreator = new NeverModelCreator();

test('Test SHACL against data - instancesIdentificationNever in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:nodeKind sh:BlankNode")
});