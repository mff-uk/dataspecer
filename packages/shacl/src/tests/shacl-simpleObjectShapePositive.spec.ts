import fs from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";
import { validateDataAgainstShape } from "./shacl-adapter.spec"

var validationResult : boolean;


async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

async function main() {
  const shapes = await loadDataset('src/tests/simpleObjectShape.ttl');
  const data = await loadDataset('src/tests/simpleObjectShapePositive-data.ttl');
  const validator = new SHACLValidator(shapes, { factory });
  const report = await validator.validate(data);
  validationResult = report.conforms;
  // Check conformance: `true` or `false`
  console.log(report.conforms)
  

  for (const result of report.results) {
    // See https://www.w3.org/TR/shacl/#results-validation-result for details
    // about each property
    console.log(result.message)
    console.log(result.path)
    console.log(result.focusNode)
    console.log(result.severity)
    console.log(result.sourceConstraintComponent)
    console.log(result.sourceShape)
  }

  // Validation report as RDF dataset
  //console.log(report.dataset)
}

test('Test SHACL against data - simple object POSITIVE', async () => {
  await main();
  expect(validationResult).toBe(true);
  //const validation = await validateDataAgainstShape('src/tests/allPrimitiveDatatypesShapeNegative-data.ttl', 
  //'src/tests/allPrimitiveDatatypesShape.ttl');
  //expect(validation).toBe(false);
});

test('Shape conforms to SHACL standard - simple object', async () => {

  const validation = await validateDataAgainstShape('src/tests/simpleObjectShape.ttl', 'src/tests/shapeToValidateShapes.ttl');
  expect(validation).toBe(true);

});
