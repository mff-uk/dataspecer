import fs, { PathLike } from "fs";
import factory  from "rdf-ext";
import  ParserN3  from "@rdfjs/parser-n3";
import  SHACLValidator  from "rdf-validate-shacl";
import validator from "turtle-validator/lib/validator";
import * as Support from "./support/testSupport";
import generate from "./support/FakeDataCreator";
import  ShapeCreator  from "./support/shapeCreator";
import  JsonSchemaCreator  from "./support/jsonSchemaCreator";
import JsonLdCreator from "./support/jsonLdCreator";
import   ModelCreator   from "./support/SimpleObjectModelCreator";
import ParserJsonld from '@rdfjs/parser-jsonld';
import { Readable } from 'stream';
import { DataFactory, Sink, Stream, BaseQuad, Quad } from 'rdf-js';

import rdf from '@rdfjs/data-model';
//import Serializer from '@rdfjs/serializer-turtle';

const Serializer = require('@rdfjs/serializer-turtle');

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
  const data = await loadDataset('src/tests/shapes/closedShape.ttl');
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

const contextPart = `{
  "@context": {
    "@version": 1.1,
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "id": "@id",
    "type": "@type",
    "Věc": {
      "@id": "https://slovník.gov.cz/generický/věci/pojem/věc",
      "@context": {
        "název": {
          "@id": "https://slovník.gov.cz/generický/věci/pojem/název",
          "@container": "@language"
        },
        "popis": {
          "@id": "https://slovník.gov.cz/generický/věci/pojem/popis",
          "@container": "@language"
        },
        "příloha": {
          "@id": "https://slovník.gov.cz/generický/věci/pojem/má-přílohu",
          "@container": "@set",
          "@context": {
            "Digitální objekt": {
              "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/digitální-objekt",
              "@context": {
                "url": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/url-ke-stažení",
                  "@type": "xsd:anyURI"
                },
                "poskytovatele": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-poskytovatele",
                  "@type": "@id"
                },
                "kurátor": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-kurátora",
                  "@type": "@id"
                },
                "autor_díla": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-autora-díla",
                  "@type": "@id"
                },
                "vykonavatel_autorské_dílo": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-vykonavatele-majetkových-práv-autorských-u-autorského-díla",
                  "@type": "@id"
                },
                "autor_originální_databáze": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-autora-originální-databáze",
                  "@type": "@id"
                },
                "vykonavatel_originální_databáze": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-vykonavatele-majetkových-práv-autorských-u-originální-databáze",
                  "@type": "@id"
                },
                "pořizovatel_databáze": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-pořizovatele-databáze",
                  "@type": "@id"
                },
                "správce_osobních_údajů": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-správce-osobních-údajů",
                  "@type": "@id"
                },
                "zpracovatel_osobních_údajů": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-zpracovatele-osobních-údajů",
                  "@type": "@id"
                },
                "typ_média": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-typ-média",
                "má_podmínky_užití": {
                  "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/má-podmínky-užití",
                  "@type": "@id",
                  "@context": {
                    "Podmínky užití": {
                      "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/podmínky-užití",
                      "@context": {
                        "obsahuje_autorské_dílo": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/obsahuje-autorské-dílo",
                          "@type": "xsd:boolean"
                        },
                        "obsahuje_více_autorských_děl": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/obsahuje-více-autorských-děl",
                          "@type": "xsd:boolean"
                        },
                        "licence_autorského_díla": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/licence-autorského-díla",
                          "@type": "@id"
                        },
                        "originální_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/originální-databáze",
                          "@type": "xsd:boolean"
                        },
                        "licence_originální_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/licence-originální-databáze",
                          "@type": "@id"
                        },
                        "ochrana_zvláštními_právy_pořizovatele_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/databáze-chráněná-zvláštními-právy-pořizovatele-databáze",
                          "@type": "xsd:boolean"
                        },
                        "licence_databáze_chráněné_zvláštními_právy_pořizovatele_databáze": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/licence-pro-databázi-chráněnou-zvláštními-právy-pořizovatele-databáze",
                          "@type": "@id"
                        },
                        "obsahuje_osobní_údaje": {
                          "@id": "https://slovník.gov.cz/generický/digitální-objekty/pojem/obsahuje-osobní-údaje",
                          "@type": "xsd:boolean"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;
 
async function parse(doc: string): Promise<Stream<Quad>>{
  console.log("doc in parse function \n" + doc);
  const parserJsonld = new ParserJsonld();

  const input = new Readable({
    read: () => {
      input.push(doc);
      input.push(null);
    }
  })

  const output = parserJsonld.import(input);
/*
  output.on('data', quad => {
    console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`)
  })
*/

//From quads to turtle
const serializer = new Serializer()
const input2 = Readable.from([
  rdf.quad(
    rdf.namedNode('https://housemd.rdf-ext.org/person/gregory-house'),
    rdf.namedNode('http://schema.org/givenName'),
    rdf.literal('Gregory')),
  rdf.quad(
    rdf.namedNode('https://housemd.rdf-ext.org/person/gregory-house'),
    rdf.namedNode('http://schema.org/familyName'),
    rdf.literal('House')),
  rdf.quad(
    rdf.namedNode('https://housemd.rdf-ext.org/person/gregory-house'),
    rdf.namedNode('http://schema.org/knows'),
    rdf.namedNode('https://housemd.rdf-ext.org/person/james-wilson'))
]);

const output2 = serializer.import(output);
output2.pipe(process.stdout);

  return output;
}

test('Test SHACL ', async () => {
  var mc = new ModelCreator();
const sm = mc.createModel();
var sc = new ShapeCreator();
const shape = sc.createShape(sm);
var jsc = new JsonSchemaCreator();
const jsonSchema = await jsc.createJsonSchema(sm);
var jldc = new JsonLdCreator();
const jsonLd = jldc.createJsonLD(sm);
  
  const dataPart = await generate(jsonSchema);
  await console.log("Data part in shacl-adapter \n" + dataPart);

  const doc = contextPart.slice(0, -1) + "," + dataPart.slice(1);

  await console.log("doc part in test\n" + doc);

  const output = await parse(doc);
  
  //await console.log("Json Schema  " + (await jsonSchema).root);
  //await main();
  //await validateDataAgainstShape("src/tests/shapeToValidateShapes.ttl","src/tests/closedShapePositive.ttl");
  //const validationResult = true;
  //const nOfErrors = validTurtle();
  //const validation = await validateDataAgainstShape("src/tests/closedShapePositive.ttl","src/tests/shapeToValidateShapes.ttl");
  await expect(true).toBe(true);

});
