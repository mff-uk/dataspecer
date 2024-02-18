import fs from "fs";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";
import * as Support from "./testSupport";
import  ShapeCreator  from "./shapeCreator";
import   ModelCreator   from "./ModelCreatorInterface";
import { ValidationReport } from 'rdf-validate-shacl/src/validation-report';
import generate, {fromJsonToTurtle} from "./FakeDataCreator";
import {ShExValidator} from "@shexjs/validator";

export const shapeToValidateShapesFile = "src/tests/shapes/shapeToValidateShapes.ttl";
export const shapeToValidateShexShapesFile = "src/tests/shexShapes/shapeToValidateShexShapes.shex";

export class TestResults{

  protected shexValidationReport;
  protected globalTestStatus;

  getGlobalTestStatus(): String{
    return this.globalTestStatus;
  }

  setGlobalTestStatus(value: String){
    this.globalTestStatus = value;
  }

  async testShexShape(testType : string, modelCreator : ModelCreator): Promise<String>{
    await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
    
    const ShExParser = require('@shexjs/parser');
    const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
    const {Parser: N3Parser, Store: N3Store} = require('n3');
    const base = 'https://example.org/';
  
    const shapeFileName = "../shexShapes/" + testType + "Shape.shex";
    const shexc = readFileSync(join(__dirname, shapeFileName), 'utf-8');
    console.log(shexc);
    const dataFileName = "../data/" + testType + ".ttl";
    const turtle = readFileSync(join(__dirname, dataFileName), 'utf-8');
    console.log(turtle);
    const mapFileName = "../shexMaps/" + testType + "Map.txt";
    const shexMap = readFileSync(join(__dirname, mapFileName), 'utf-8');
    console.log(shexMap);
  
    const shexMapObjectFromFile = JSON.parse(shexMap) ;
    const shexMapObject = [shexMapObjectFromFile];
    return new Promise((resolve, reject) => {
      
      const schema = ShExParser.construct(base)
            .parse(shexc);
      const g = new N3Store();
      new N3Parser({baseIRI: base}).parse(turtle, (error, quad, prefixes) => {
        if (quad){
          g.addQuad(quad);
          console.log("adding quad");
        }
        else {
          resolve(JSON.stringify(
            new ShExValidator(schema, RdfJsDb(g))
              .validateShapeMap(shexMapObject),
            null, 2 
          ));
          //console.log(this.shexValidationReport);
        }
      });
  });
  /*
    const validationReport =  validateShex("../shexShapes/" + testType + "Shape.shex", 
      "../shexMaps/" + testType + "Map.txt",
      "../data/" + testType + ".ttl");
  */
    console.log(this.shexValidationReport);
    const parsed = JSON.parse(this.shexValidationReport.toString());
    this.setGlobalTestStatus(parsed[0].status);
    //return testStatus;
  }


}


export async function prepareShexShape(mc : ModelCreator, shapeFileName : string): Promise<boolean> {
  const sm = await mc.createModel();
  var sc = new ShapeCreator();
  const shape = await sc.createShexShape(sm);
  const written = await Support.syncWriteFile(shapeFileName, shape);
  return true;
}

export async function prepareShape(mc : ModelCreator, shapeFileName : string): Promise<boolean> {
  const sm = await mc.createModel();
  var sc = new ShapeCreator();
  const shape = await sc.createShape(sm);
  const written = await Support.syncWriteFile(shapeFileName, shape);
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
  //console.log(contents); 

  return true;
}

export async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return  await factory.dataset().import(parser.import(stream))
}

export async function testPositive(testType : string, modelCreator : ModelCreator): Promise<ValidationReport<typeof factory>> {
  const dataPart = await generate('./src/tests/data/' + testType + 'Schema.json');  
  await fromJsonToTurtle(dataPart.toString(), testType);
  await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/" + testType + "FakeDataTurtle.ttl", "src/tests/shapes/" + testType + "Shape.ttl");
  return validation;
}

export async function testNegative(testType : string, modelCreator : ModelCreator): Promise<ValidationReport<typeof factory>>{
  //const dataPart = await generate('./src/tests/data/' + testType + 'Schema.json');  
  // Transform the raw json data to Turtle format with the help of JSON-LD Context from file
  //await fromJsonToTurtle(dataPart.toString(), testType);
  const slicedName = testType.slice(0, -8);
  await Support.prepareShape(modelCreator, '../shapes/' + slicedName + 'Shape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/" + testType + ".ttl", "src/tests/shapes/" + slicedName + "Shape.ttl");
  return validation;
}

export async function testFromData(testType : string, modelCreator : ModelCreator): Promise<ValidationReport<typeof factory>>{
  const slicedName = (testType.endsWith("Negative")) ? testType.slice(0, -8) : testType;
  await Support.prepareShape(modelCreator, '../shapes/' + slicedName + 'Shape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/data/" + testType + ".ttl", "src/tests/shapes/" + slicedName + "Shape.ttl");
  return validation;
}

export async function testShape(testType : string, modelCreator : ModelCreator): Promise<ValidationReport<typeof factory>>{
  await Support.prepareShape(modelCreator, '../shapes/' + testType + 'Shape.ttl');
  const validation = await Support.validateDataAgainstShape("src/tests/shapes/" + testType + "Shape.ttl", Support.shapeToValidateShapesFile);
  return validation;
}

function validateShex(shapeFileName : string, mapFileName: string, dataFileName: string): String{
  var validationReport : String = "";

  const ShExParser = require('@shexjs/parser');
  const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
  const {Parser: N3Parser, Store: N3Store} = require('n3');
  const base = 'https://example.org/';

  //const filename = "data/shexShape.shex";
  const shexc = readFileSync(join(__dirname, shapeFileName), 'utf-8');
  console.log(shexc);
  //const filenameTurtle = "data/shexData.ttl";
  const turtle = readFileSync(join(__dirname, dataFileName), 'utf-8');
  console.log(turtle);
  //const filenameMap = "data/shexMap.txt";
  const shexMap = readFileSync(join(__dirname, mapFileName), 'utf-8');
  console.log(shexMap);

    //const shexMapObjectFromFile = JSON.parse(shexMap) ;

  //const shexMapObject = [shexMapObjectFromFile];
  const schema = ShExParser.construct(base)
        .parse(shexc);
  const g = new N3Store();
  new N3Parser({baseIRI: base}).parse(turtle, (error, quad, prefixes) => {
    if (quad){
      g.addQuad(quad);
      console.log("adding quad");
    }
    else {
      shexValidationReport = JSON.stringify(
        new ShExValidator(schema, RdfJsDb(g))
          .validateShapeMap([{ node : 'https://example.org/n1', shape: 'https://example.org/S1' }]),
        null, 2 
      );
      console.log(shexValidationReport);
    }
  });

  console.log("validationReport: \n" + shexValidationReport);

  return shexValidationReport;
}

function validateWithShexValidator(schema : any, shexMap : any, g : any): String{
  return "";
}

export function testShexShape(testType : string, modelCreator : ModelCreator){
  //await Support.prepareShexShape(modelCreator, '../shexShapes/' + testType + 'Shape.shex');
  
  const ShExParser = require('@shexjs/parser');
  const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');
  const {Parser: N3Parser, Store: N3Store} = require('n3');
  const base = 'https://example.org/';

  const shapeFileName = "../shexShapes/" + testType + "Shape.shex";
  const shexc = readFileSync(join(__dirname, shapeFileName), 'utf-8');
  console.log(shexc);
  const dataFileName = "../data/" + testType + ".ttl";
  const turtle = readFileSync(join(__dirname, dataFileName), 'utf-8');
  console.log(turtle);
  const mapFileName = "../shexMaps/" + testType + "Map.txt";
  const shexMap = readFileSync(join(__dirname, mapFileName), 'utf-8');
  console.log(shexMap);

  //const shexMapObjectFromFile = JSON.parse(shexMap) ;
  //const shexMapObject = [shexMapObjectFromFile];
  const schema = ShExParser.construct(base)
        .parse(shexc);
  const g = new N3Store();
  new N3Parser({baseIRI: base}).parse(turtle, (error, quad, prefixes) => {
    if (quad){
      g.addQuad(quad);
      console.log("adding quad");
    }
    else {
      shexValidationReport = JSON.stringify(
        new ShExValidator(schema, RdfJsDb(g))
          .validateShapeMap([{ node : 'https://example.org/n1', shape: 'https://example.org/S1' }]),
        null, 2 
      );
      console.log(shexValidationReport);
    }
  });
/*
  const validationReport =  validateShex("../shexShapes/" + testType + "Shape.shex", 
    "../shexMaps/" + testType + "Map.txt",
    "../data/" + testType + ".ttl");
*/
  console.log(shexValidationReport);
  const parsed = JSON.parse(shexValidationReport.toString());
  const testStatus = parsed[0].status;
  //return testStatus;
}

export async function validateDataAgainstShape( dataFileName : string, shapeFileName : string ) : Promise<ValidationReport<typeof factory>>{

    const shapes = await this.loadDataset(shapeFileName);
    const data = await this.loadDataset(dataFileName);
    const validator = new SHACLValidator(shapes, { factory });
    const report = await validator.validate(data);
    // Check conformance: `true` or `false`
    //console.log("Validation conforms :" + report.conforms)
    
    for (const result of report.results) {
      // See https://www.w3.org/TR/shacl/#results-validation-result for details
      // about each property
      //console.log("File: " + dataFileName + "\nMessage: " + result.message + "\nPath: " + result.path + "\nfocusNode: " + result.focusNode + "\nresult.severity: " + result.severity + "\nSourceConstraintComponent: " + result.sourceConstraintComponent + "\nSourceShape: " + result.sourceShape);
    }

    //return conforms;
    return report; 
}


