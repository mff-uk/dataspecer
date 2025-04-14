import * as Support from "./support/testSupport.ts";
import SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";
import * as fs from "fs";


const testType = "path";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data -  in syntax ', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:path <https://slovník.gov.cz/generický/adresy/pojem/prvek-rúian>")
});