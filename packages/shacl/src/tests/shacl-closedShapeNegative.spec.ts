import fs, { PathLike } from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";
import { validateDataAgainstShape } from "./shacl-adapter.spec";

var validationResult : boolean;

async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

async function main() {
  const shapes = await loadDataset('src/tests/closedShape.ttl');
  const data = await loadDataset('src/tests/closedShapeNegative-data.ttl');
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
}

test('Test SHACL against data - closed shape NEGATIVE  ', async () => {
  await main();
  
  expect(validationResult).toBe(false);

  //const validation = await validateDataAgainstShape("src/tests/closedShapeNegative-data.ttl","src/tests/closedShape.ttl");
  
  //expect(validation).toBe(false);
});
