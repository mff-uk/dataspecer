import { ShaclAdapter } from "../shacl-adapter";

import fs from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";

import {
  StructureModel,
  StructureModelClass,
  StructureModelType,
  StructureModelComplexType,
  StructureModelProperty,
  StructureModelPrimitiveType,
  StructureModelCustomType,
  StructureModelSchemaRoot,
} from "@dataspecer/core/structure-model/model";

const sum = new ShaclAdapter(null, null, null);
var validationResult : boolean;
async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return factory.dataset().import(parser.import(stream))
}

function createModel(): StructureModel{
  var model = new StructureModel();

    var primitiveType1 : StructureModelPrimitiveType;
    primitiveType1 = new StructureModelPrimitiveType();

    var property1 : StructureModelProperty;
    property1 = new StructureModelProperty();
    property1.cardinalityMax = 2;
    property1.cardinalityMin = 0;
    property1.cimIri = "https://example.com/mojeCimIri";
    property1.dataTypes = [primitiveType1];
    property1.dematerialize = false;
    property1.humanDescription = {["cs"]: "Popisek 1"};
    property1.humanLabel = {["cs"]: "Label 1"};
    property1.isReverse = false;
    property1.pathToOrigin = null;
    property1.pimIri = "https://example.com/mojePimIri";
    property1.psmIri = "https://example.com/mojePsmIri";
    property1.technicalLabel = "technicky popisek";


    var class1 : StructureModelClass;
    class1 = new StructureModelClass();

    var root1 : StructureModelSchemaRoot;
    root1 = new StructureModelSchemaRoot();
    root1.classes = [class1];

    model.roots = [root1];

  return model;
}

async function main() {
  const shapes = await loadDataset('src/tests/shape.trig')
  const data = await loadDataset('src/tests/data.trig')

  const validator = new SHACLValidator(shapes, { factory })
  const report = await validator.validate(data)

  // Check conformance: `true` or `false`
  console.log(report.conforms)
  validationResult = report.conforms;

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

main();

test('Test SHACL ', async () => {
  await main();
  expect(validationResult).toBe(true);
});
