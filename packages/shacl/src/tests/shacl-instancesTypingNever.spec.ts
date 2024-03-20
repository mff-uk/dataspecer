import * as Support from "./support/testSupport";
import NeverModelCreator from "./support/NeverModelCreator";
import * as fs from "fs";


const testType = "instancesTypingNever";
const modelCreator = new NeverModelCreator();

test('Test SHACL against data - instancesTypingNever in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain(`sh:not [`)
  expect(shape).toContain(`a sh:PropertyShape;`)
  expect(shape).toContain(`sh:path <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>;`)
  expect(shape).toContain(`sh:minCount 1`)
});