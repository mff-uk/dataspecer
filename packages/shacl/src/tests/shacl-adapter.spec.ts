import fs, { PathLike } from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";
import validator from "turtle-validator/lib/validator";
import * as Support from "./support/testSupport";

import  ShapeCreator  from "./support/shapeCreator";
import  JsonSchemaCreator  from "./support/jsonSchemaCreator";
import JsonLdCreator from "./support/jsonLdCreator";
import   ModelCreator   from "./support/SimpleObjectModelCreator";

//var mc = new ModelCreator();
//const sm = mc.createModel();
//var sc = new ShapeCreator();
//const shape = sc.createShape(sm);
//var jsc = new JsonSchemaCreator();
//const jsonSchema = jsc.createJsonSchema(sm);
//var jldc = new JsonLdCreator();
//const jsonLd = jldc.createJsonLD(sm);
var result = undefined;

var validationResult : boolean;


async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

export async function validateDataAgainstShape( shapeFileName : string, dataFileName : string ) : Promise<boolean>{
  var validation : boolean;
  const shapes = await loadDataset(shapeFileName);
  const data = await loadDataset(dataFileName);
  const validator = new SHACLValidator(shapes, { factory });
  const report = await validator.validate(data);
  validation = report.conforms;

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
  return validation;
}

async function main() {
  
  //const shapes = await loadDataset('src/tests/shape.trig')
  //const data = await loadDataset('src/tests/data.trig')
  const shapes = await loadDataset('src/tests/shapes/shapeToValidateShapes.ttl');
  const data = await loadDataset('src/tests/shapes/closedShapePositive.ttl');
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
  //await validateDataAgainstShape("src/tests/shapeToValidateShapes.ttl","src/tests/closedShapePositive.ttl");
  //const validationResult = true;
  //const nOfErrors = validTurtle();
  //const validation = await validateDataAgainstShape("src/tests/closedShapePositive.ttl","src/tests/shapeToValidateShapes.ttl");
  expect(validationResult).toBe(true);

});
