
import fs from "fs";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";
import * as Support from "./testSupport";
import  ShapeCreator  from "./shapeCreator";
import   ModelCreator   from "./ModelCreatorInterface";

export async function prepareShape(mc : ModelCreator, shapeFileName : string): Promise<boolean> {
  const sm = await mc.createModel();
  var sc = new ShapeCreator();
  const shape = await sc.createShape(sm);
  Support.syncWriteFile(shapeFileName, shape);
  return true;
}

export async function syncWriteFile(filename: string, data: any): Promise<boolean> {
  /**
   * flags:
   *  - w = Open file for reading and writing. File is created if not exists
   *  - a+ = Open file for reading and appending. The file is created if not exists
   */
  writeFileSync(join(__dirname, filename), data, {
    flag: 'w',
  });

  const contents = readFileSync(join(__dirname, filename), 'utf-8');
  console.log(contents); 

  return true;
}

export async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

export async function validateDataAgainstShape( dataFileName : string, shapeFileName : string ) : Promise<boolean>{
    var conforms = false;

    const shapes = await this.loadDataset(shapeFileName);
    const data = await this.loadDataset(dataFileName);
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    conforms = report.conforms;
    // Check conformance: `true` or `false`
    //console.log(report.conforms)
    
    for (const result of report.results) {
      // See https://www.w3.org/TR/shacl/#results-validation-result for details
      // about each property
      console.log("File: " + dataFileName + "\nMessage: " + result.message + "\nPath: " + result.path + "\nfocusNode: " + result.focusNode + "\nresult.severity: " + result.severity + "\nSourceConstraintComponent: " + result.sourceConstraintComponent + "\nSourceShape: " + result.sourceShape);
    }

    return conforms; 
}


