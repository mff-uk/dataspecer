/*
import fs from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";

export class Support {
async loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

async validateDataAgainstShape( dataFileName : string, shapeFileName : string ) : Promise<boolean>{
    var conforms = false;

    const shapes = await this.loadDataset(shapeFileName);
    const data = await this.loadDataset(dataFileName);
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    conforms = report.conforms;
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

    return conforms; 
}
}
*/
