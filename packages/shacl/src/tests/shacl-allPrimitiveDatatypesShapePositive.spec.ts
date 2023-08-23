

import fs, { PathLike } from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";


var validationResult : boolean;


async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

async function main() {
  //const shapes = await loadDataset('src/tests/shape.trig')
  //const data = await loadDataset('src/tests/data.trig')
  const shapes = await loadDataset('src/tests/allPrimitiveDatatypesShape.ttl');
  const data = await loadDataset('src/tests/allPrimitiveDatatypesShapePositive-data.ttl');
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

test('Test SHACL ', async () => {
  //await console.log("Json Schema  " + (await jsonSchema).root);
  await main();
  //const validationResult = true;
  //const nOfErrors = validTurtle();
  expect(validationResult).toBe(true);
  /*function callback(error, data) {
  try {
    nOfErrors.then(result => {
      expect(result).toBe(0);
      done();
    }
      

      );
    
  } catch (error) {
    done(error);
  }
}
  callback;
  */
  //await expect(validTurtle("src/tests/shape.trig")).resolves.toBe(0);
});
