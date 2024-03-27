import * as Support from "./support/testSupport";
import SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";
import * as fs from "fs";


const testType = "association";
const modelCreator = new SimpleObjectModelCreator();

test('Test SHACL against data - association in syntax ', async () => {
  await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const shape = await fs.readFileSync("src/tests/shapes/" + testType + "Shape.ttl",
    { encoding: 'utf8', flag: 'r' });
  expect(shape).toContain("sh:node <cb7b59f426ab7ddeb06a5fac76e9e517uzemi-mestskeho-obvoduShape>")
});