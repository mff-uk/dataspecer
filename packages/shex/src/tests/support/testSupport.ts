import fs from "fs";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import * as Support from "./testSupport.ts";
import  ShapeCreator  from "./shapeCreator.ts";
import   ModelCreator   from "./ModelCreatorInterface.ts";
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
    //console.log(shexc);
    const dataFileName = "../data/" + testType + ".ttl";
    const turtle = readFileSync(join(__dirname, dataFileName), 'utf-8');
    //console.log(turtle);
    const mapFileName = "../shexMaps/" + testType + "Map.txt";
    const shexMap = readFileSync(join(__dirname, mapFileName), 'utf-8');
    //console.log(shexMap);
  
    const shexMapObjectFromFile = JSON.parse(shexMap) ;
    const shexMapObject = [shexMapObjectFromFile];
    return new Promise((resolve, reject) => {
      
      const schema = ShExParser.construct(base)
            .parse(shexc);
      const g = new N3Store();
      new N3Parser({baseIRI: base}).parse(turtle, (error, quad, prefixes) => {
        if (quad){
          g.addQuad(quad);
          //console.log("adding quad");
        }
        else {
          resolve(JSON.stringify(
            new ShExValidator(schema, RdfJsDb(g))
              .validateShapeMap(shexMapObject),
            null, 2 
          ));
        }
      });
  });


  }
}

export async function shexMapTest(modelCreator : ModelCreator): Promise<String>{
  const sm = await modelCreator.createModel();
  var sc = new ShapeCreator();
  const shape = await sc.createShexMap(sm);

  return shape;
}

export async function prepareShexShape(mc : ModelCreator, shapeFileName : string): Promise<boolean> {
  const sm = await mc.createModel();
  var sc = new ShapeCreator();
  const shape = await sc.createShexShape(sm);
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



