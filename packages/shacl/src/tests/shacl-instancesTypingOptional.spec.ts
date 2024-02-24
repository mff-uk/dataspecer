import * as Support from "./support/testSupport";
import OptionalModelCreator from "./support/OptionalModelCreator";
import * as fs from "fs";


const testType = "instancesTypingOptional";
const modelCreator = new OptionalModelCreator();

test('Test SHACL against data - instancesTypingOptional in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).not.toContain("sh:class");
});