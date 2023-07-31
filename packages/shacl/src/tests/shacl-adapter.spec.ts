import { ShaclAdapter } from "../shacl-adapter";
import * as fs from "fs";
import { factory } from "rdf-ext";
import { ParserN3 } from "@rdfjs/parser-n3";
import { SHACLValidator } from "rdf-validate-shacl";



const sum = new ShaclAdapter(null, null, null);

/*
const fs = require('fs');
const factory = require('rdf-ext');
const ParserN3 = require('@rdfjs/parser-n3');
const SHACLValidator = require('rdf-validate-shacl');
*/




async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return factory.dataset().import(parser.import(stream))
}

async function main() {
  const shapes = await loadDataset('my-shapes.ttl')
  const data = await loadDataset('my-data.ttl')

  const validator = new SHACLValidator(shapes, { factory })
  const report = await validator.validate(data)

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
  console.log(report.dataset)
}

main();

/*
test('adds 1 + 2 to equal 3', () => {
  expect((1, 2)).toBe(3);
});
*/