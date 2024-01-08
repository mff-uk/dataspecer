/*
import * as N3 from "n3";
import { LanguageString } from "@dataspecer/core/core";
import md5 from "md5";
import * as Support from "./support/testSupport";
import ClosedModelCreator from "./support/ClosedModelCreator";
import fs from "fs";
import fetch from "node-fetch";
import shexjs__loader from "@shexjs/loader";
import {ShExValidator} from "@shexjs/validator";
import { RdfJsDb } from '@shexjs/neighborhood-rdfjs';
//const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs');



jest.useFakeTimers();
const loader = require('@shexjs/loader');

const shexc = "./data/shexSchema.shex";  // schema location
const data = "./data/shexData.ttl";        // data location
const node = "http://shex.io/examples/Issue1#Issue1"; // node in that data

let theGraph = fs.readFileSync('./src/tests/data/shexData.ttl',{ encoding: 'utf8', flag: 'r' });







const testType = "closedNegative";
const modelCreator = new ClosedModelCreator();

test('Test ShEx against example URL data  ', async () => {

  let theGraph = fs.readFileSync('./src/tests/data/shexData.ttl',{ encoding: 'utf8', flag: 'r' });
  shexjs__loader.load([validationShape], [], [], []).then(function (loaded) {
    var db = ShEx.Util.makeN3DB(theGraph);
    var validator = ShEx.Validator.construct(loaded.schema, { results: "api" });
    var result = validator.validate(db, [{node: dataID, shape: shapeURL}]);
    return result;
  }).catch(e => console.error(e));


    const shexc = "http://shex.io/examples/IssueSchema";  // schema location
const data = "http://shex.io/examples/Issue1";        // data location
const node = "http://shex.io/examples/Issue1#Issue1"; // node in that data

const ShExLoader = shexjs__loader({        // initialize with:
  fetch: fetch,                       //   fetch implementation
  rdfjs: N3,                                          //   RdfJs Turtle parser
});

ShExLoader.load({shexc: [shexc]}, {turtle: [data]})
  .then(function (loaded) {
    var db = RdfJsDb(loaded.data);
    var validator = new ShExValidator(loaded.schema, db, { results: "api" });
    const smap = [                                // array of node/shape pairs
      {node: node,                                //   JSON-LD @id for node
       shape: ShExValidator.Start}                //   schemas's start shape
    ]
    var result = validator.validateShapeMap(smap);  // success if no "errors"
    console.log(JSON.stringify(result, null, 2));
  } );


  const validation = await Support.testNegative(testType, modelCreator);
  expect(validation.conforms).toBe(false);
});
*/

import * as Support from "./support/testSupport";
import  SimpleObjectModelCreator from "./support/SimpleObjectModelCreator";

const testType = "simpleObject";
const modelCreator = new SimpleObjectModelCreator();

test.skip('Shape conforms to SHACL standard - simple object', async () => {
  const validation = await Support.testShape(testType, modelCreator);
  expect(validation.conforms).toBe(true);
});