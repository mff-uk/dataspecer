import * as Support from "./support/testSupport.ts";
import SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";
import * as fs from "fs";


const testType = "labelDescription";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - labelDescription in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:name \"Adresa\"@cs.");
  expect(shape).toContain("sh:description \"Adresa popisek\"@cs");
});