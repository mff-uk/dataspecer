import * as Support from "./support/testSupport.ts";
import SimpleObjectModelCreator from "./support/SimpleObjectModelCreator.ts";
import * as fs from "fs";


const testType = "property";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - property in syntax', async () => {
    await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:property <cef40358a93b64dbf63d1e50a332dad8cislo-popisne-popisekShape>")
});