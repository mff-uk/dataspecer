import fs from "fs";
import generate, {fromJsonToTurtle} from "./support/FakeDataCreator";
import AllPrimitiveTypesModelCreator from "./support/AllPrimitiveTypesModelCreator";
import * as Support from "./support/testSupport";

test('Test SHACL ', async () => {
  const testType = "allPrimitiveDatatypes";
  const modelCreator = new AllPrimitiveTypesModelCreator();
    // UNQUOTE WHEN REPAIRED decimal number getting exponential when transforming from json to nquads
  // Generate fake data from JSON Schema file
  //const dataPart = await generate('./src/tests/data/' + testType + 'Schema.json');  
  // Transform the raw json data to Turtle format with the help of JSON-LD Context from file

  //await fromJsonToTurtle(dataPart.toString(), testType);
  await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/" + testType + "FakeDataTurtle.ttl", "src/tests/shapes/" + testType + "Shape.ttl");
  expect(validation.conforms).toBe(true);
});

