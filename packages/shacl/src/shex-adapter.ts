import {
  StructureModel,
  StructureModelClass,
  StructureModelType,
  StructureModelComplexType,
  StructureModelProperty,
  StructureModelPrimitiveType,
  StructureModelCustomType,
} from "@dataspecer/core/structure-model/model";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
import {
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import {isTheSameEntity} from "./shacl-support.js";
import { OFN } from "@dataspecer/core/well-known";
//import { N3Deref } from 'n3';
//import { DataFactory as DataFactoryN3 } from 'n3';
//import { Writer as WriterN3 } from 'n3';
import * as N3 from "n3";
import { LanguageString } from "@dataspecer/core/core";
import md5 from "md5";

// ShEx 2.0
/*
Implementation notes
-----
According to the list of validatable properties for ShEx relevant to Dataspecer:

Shapes and Constraints

Focus Nodes - focus nodes are generated as the root classes of the structure
  = Shape maps TODO == TARGETS

Properties  - primitive datatypes available in the shape TODO
            - associations available through referencing other shapes TODO

Core Constraint Components

    Value Type Constraint Components
      - Class - TODO 
      - Datatype after path TODO
      - NodeKind (IRI, BNode, Literal, NonLiteral) TODO
    Cardinality Constraint Components (?+*{x,y}{x}{x,}) TODO
    String-based Constraint Components: patterns available in ShEx
      - pattern after path /regex/
    Logical Constraint Components -- TODO: 
    Shape-based Constraint Components -- TODO 
      - the shape itself
      - reference a property corresponding to different shape after path 
    Nested Shapes - It is possible to avoid defining two shapes when one of them is just an auxiliary shape that is not needed elsewhere TODO
    Other Constraint Components -- Closed property TODO

    TODO: tests being sourced locally
    TODO: typed/untyped instances in SHACL - can't rely on sh:targetClass, needs to use nested shapes.

*/

// Tuple type
type QName = [prefix: string | null, localName: string];
type PrefixDef = [tag: string, iri: string];
type sameTag = [tag: string, number: number];
type classNameShapeTuple = [classShapeName: string, classObject: StructureModelClass];
type StructureModelClassOrProperty = StructureModelClass | StructureModelProperty;

const SHEX_PREFIX_DEF: PrefixDef = ["sh", "http://www.w3.org/ns/shacl#"];
const RDFS_PREFIX_DEF : PrefixDef = ["rdfs", "http://www.w3.org/2000/01/rdf-schema#"];
//const N3 = require('n3');
const { DataFactory } = N3;
//const N3 = N3Deref;
const { namedNode, literal, defaultGraph, triple } = DataFactory;
//const { Writer } = WriterN3;
export class ShExAdapter {
  
  
  protected model: StructureModel;
  protected context: ArtefactGeneratorContext;
  protected artefact: DataSpecificationArtefact;
  protected knownPrefixes: PrefixDef[] = []; // list of tags and corresponding IRIs
  //protected knownCims: KnownCim[] = []; 
  protected shapes: string[] = []; // Entity beginning with name of the shape and ending with .
  protected debugString: string = "";
  protected sameTags: sameTag[] = [];
  protected classesUsedInStructure: string[] = [];
  protected sameClass: classNameShapeTuple[] = [];
  protected thisDataStructurePrefix : string = "";
  protected writer: any;
  protected scriptString: string = "";
  protected prefixesString: string = "";
  protected insidesString: string = "";
  protected baseURL: string = "";

  constructor(
    model: StructureModel,
    context: ArtefactGeneratorContext | null,
    artefact: DataSpecificationArtefact
  ) {
    this.model = model;
    this.context = context;
    this.artefact = artefact;
    if(!("publicBaseUrl" in this.artefact.configuration)){
      this.artefact.configuration["publicBaseUrl"] = "https://example.org/";
    }
    else if(isEmptyOrSpaces(this.artefact.configuration["publicBaseUrl"])){
      this.artefact.configuration["publicBaseUrl"] = "https://example.org/";
    }
    this.baseURL = this.artefact.configuration["publicBaseUrl"];
    this.writer  = new N3.Writer({ prefixes: { sh: 'http://www.w3.org/ns/shacl#', rdfs: "http://www.w3.org/2000/01/rdf-schema#", base: this.baseURL } }); 
  }

  public generate = async () => {
    
    if (this.model.roots.length > 1) {
      console.warn("SHACL generator: Multiple schema roots not supported yet.");
    }

    const rootClasses = this.model.roots[0].classes;
    // Iterate over all classes in root OR
    for (const root of rootClasses) {
      this.registerClasses(root);
      
      this.generateClassConstraints(root, null);
    }

    var resultString = "";

    resultString = resultString + this.generatePrefixesString();
    for(const part of this.shapes){
      resultString = resultString + part;
    }
    
    return { data: resultString };
    //return { data: this.scriptString};
  };

  generatePrefixesString(): string {
    this.knownPrefixes.push(SHEX_PREFIX_DEF);
    this.knownPrefixes.push(RDFS_PREFIX_DEF);
    var prefixesString = "";
    let iterations = this.knownPrefixes.length;
    var prefixesObject: { [key: string]: any } = {};

    for(const tuple of this.knownPrefixes){
      var newAttribute = tuple[0];
      prefixesObject[newAttribute] =  tuple[1] ;
    }

    //this.writer  = new N3.Writer({ prefixes: prefixesObject});
/*
    prefixesString = prefixesString.concat(`this.writer  = new N3.Writer({ prefixes: { `);
    for(const tuple of this.knownPrefixes){
      prefixesString = prefixesString.concat(`${ tuple[0] }: '${ tuple[1] }'`);
      if(--iterations){
        prefixesString = prefixesString.concat(`, \n`);
      }
    }
    prefixesString = prefixesString.concat(` } });\n`);
    */
    return prefixesString;
  }

  generateClassConstraints(root: StructureModelClass, objectOf : String): string {
    var newResult = "";
    var nodeName : string;
    
    nodeName = this.generateNodeShapeName(root);
    const prefixTag = this.prefixify(root.cimIri)[0];
    const prefixForName = this.knownPrefixes.find(tuple => tuple[0] === prefixTag);
    //const classNameIri = prefixForName[1]  + nodeName;
    const classNameIri = nodeName;
    // TODO Make sure the shape name is not duplicate for completely different class
    if(this.sameClass.find(tuple => tuple[0] === nodeName) == null){
      // The class has not been Shaped yet -- to get rid of duplicate shape
      newResult = newResult.concat(nodeName );
      newResult = newResult.concat(this.prePropertyStatements(root));
      newResult = newResult.concat("{\n\t");
      newResult = newResult.concat("\n" + this.generateShape(root, classNameIri, objectOf));
      newResult = newResult.concat(this.generatePropertiesConstraints(root, classNameIri));
      newResult = newResult.concat("}\n");

      this.shapes.push(newResult);
      this.sameClass.push([nodeName, root]);
    }
    return nodeName;
  }

  prePropertyStatements(root: StructureModelClass): string {
    var newResult = "";
    

    if(root.regex != null && root.regex != undefined && root.regex != ""){
      newResult = newResult.concat(" \\" + root.regex + "\\");
    }

    if(root.isClosed){
      newResult = newResult.concat(" CLOSED");
        
    }

    switch(root.instancesHaveIdentity){
      case "ALWAYS": newResult = newResult.concat(" IRI");
      break;
      case "NEVER": newResult = newResult.concat(" BNode");
      break;
      case "OPTIONAL": newResult = newResult.concat(" NonLiteral");
      break;
      default: newResult = newResult.concat(" NonLiteral");
    }

    return newResult;
  }

  generateShape(root: StructureModelClass, classNameIri: string, objectOf : String): string {

    var newResult = "";
    newResult = newResult.concat("\ta " + root.cimIri );
    /*this.writer.addQuad(
      namedNode( classNameIri),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/shacl#NodeShape')
    );
    */
    switch(root.instancesSpecifyTypes){
      case "ALWAYS": {
        this.writer.addQuad(
          namedNode( classNameIri),
          namedNode('http://www.w3.org/ns/shacl#targetClass'),
          namedNode( root.cimIri)
        );
      }
        break;
      case "NEVER": {
        this.writer.addQuad(
          namedNode(classNameIri),
          namedNode('http://www.w3.org/ns/shacl#not'),
          this.writer.blank([{
            predicate: namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
            object:    namedNode('http://www.w3.org/ns/shacl#PropertyShape'),
          },{
            predicate: namedNode('http://www.w3.org/ns/shacl#path'),
            object:    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          },{
            predicate: namedNode('http://www.w3.org/ns/shacl#minCount'),
            object:    literal(1),
          }])
      )}
      case "OPTIONAL": 
        default: {
          if(objectOf == null){
            /*
            // The target node is the root class, there is no object of predicate to rely on
            for (var property in root.properties) {
              // TODO
            }
            this.writer.addQuad(
              namedNode( classNameIri),
              namedNode('http://www.w3.org/ns/shacl#or'),
              namedNode( objectOf )
            );
            */
          } else{
            // The target node is not the root class, we can rely on it being object of a predicate
            this.writer.addQuad(
              namedNode( classNameIri),
              namedNode('http://www.w3.org/ns/shacl#targetObjectsOf'),
              namedNode( objectOf )
            );
          }
        }
    }
    
    return newResult;
  }

  generateLanguageString(languageDescription: LanguageString, classNameIri: string, blankNodes: any[], attribute: string): void {
    const predicate = "http://www.w3.org/ns/shacl#" + attribute;
    if(classNameIri != null){
      for (const languageTag in languageDescription) {
        const language = languageDescription[languageTag];
        if(languageDescription != null){
          this.writer.addQuad(
            namedNode( classNameIri ),
            namedNode(predicate),
            literal(language , languageTag )
          );
          
        }
      }
    } else{
      for (const languageTag in languageDescription) {
        const language = languageDescription[languageTag];
        if(languageDescription != null){
          blankNodes.push({
            predicate: namedNode(predicate),
            object:    literal(language , languageTag )
          });
        }
      }
    }
  }

  /**
   * The function takes available description (technical or human label) and makes it camel case.
   * @param root
   * @returns Camel case name for the shape.
   */
  public generateNodeShapeName(root: StructureModelClass): string {
    var capitalizedTechnicalLabel = "";
    
    if (root.technicalLabel != null) {
      const split = root.technicalLabel.split(" ",5);
      this.debugString = this.debugString + `\n${split}`;
      for(const piece of split){
        capitalizedTechnicalLabel = capitalizedTechnicalLabel + piece.charAt(0).toUpperCase() +
        piece.slice(1);
      }
    } else {
      for (const languageTag in root.humanLabel) {
        const language = root.humanLabel[languageTag];
        this.debugString = this.debugString + `\n${languageTag}`;
        const split = language.split(" ",5);
        this.debugString = this.debugString + `\n${split}`;
        for(const piece of split){
          capitalizedTechnicalLabel = capitalizedTechnicalLabel + piece.charAt(0).toUpperCase() +
          piece.slice(1);
        }
       
      }
    }
    this.debugString = this.debugString + `\n${capitalizedTechnicalLabel}`;

    return this.getIRIforShape(root);
    //return capitalizedTechnicalLabel + "Shape";
  }



  generatePropertiesConstraints(root: StructureModelClass, classNameIri: string): string {
    var newResult = "";
    var propDesc = "";
    if (root.properties != null && root.properties.length != 0) {
      for (const [i, prop] of root.properties.entries()) {

        const cardinalitymin = prop.cardinalityMin;
        const cardinalitymax = prop.cardinalityMax;
        const cimiri = prop.cimIri;
        const humanLabel = prop.humanLabel;
        const humandesc = prop.humanDescription;
        const datatypes = prop.dataTypes;
        const demat = prop.dematerialize;
        const isReverse = prop.isReverse;
        const pathtoorigin = prop.pathToOrigin;
        
        for (var dt of datatypes) {
          if(i > 0){
            newResult = newResult.concat(";");
          }
          newResult = newResult.concat("\n");
          newResult = newResult.concat("\t");
          if(isReverse){
            newResult = newResult.concat(" ^");
          } 
            
          newResult = newResult.concat(cimiri);
          

          if(dt.isAttribute() == true){
            // If the datatype is set, try to match it to xsd datatypes. If unable, use its IRI.
        const dtcasted = <StructureModelPrimitiveType> dt;
        if(dtcasted != null){
          const datatypeFromMap = simpleTypeMapQName[dtcasted.dataType];
          var datatypeString = "";
          
          if(datatypeFromMap != undefined){
            datatypeString = `${datatypeFromMap[0]}:${datatypeFromMap[1]}`;
            if(this.knownPrefixes.find(tuple => tuple[0] === "xsd") == null){
              this.knownPrefixes.push(["xsd","http://www.w3.org/2001/XMLSchema#"]);
            }
              newResult = newResult.concat(" " + simpleTypeMapIRI[dtcasted.dataType] ); 
            if(simpleTypeMapIRI[dtcasted.dataType] == "http://www.w3.org/2001/XMLSchema#anyURI"){
              if(dtcasted.regex != null && dtcasted.regex != undefined && dtcasted.regex != ""){
                newResult = newResult.concat(" \\" + dtcasted.regex.toString() + "\\" ); 
              }
            }
          } else{
            if(dtcasted.dataType != null){
              newResult = newResult.concat(" " + dtcasted.dataType ); 
            }
          }
        
        }
          } else{
            for (var dt of datatypes) {
              // create new Shape and tie this property to it     
              const dtcasted = <StructureModelComplexType> dt;
            //Create Property Shape to connect to
            const nodeIRI = this.getIRIforShape(prop);
             // Add datatype for the PopertyNode
            const nameForAnotherClass = this.generateClassConstraints(dtcasted.dataType, cimiri);
            newResult = newResult.concat(" @" + nameForAnotherClass); 
            }
          }

          if((cardinalitymin == 0) && (cardinalitymax == 1)){
            newResult = newResult.concat(" ?");
          }
          else if((cardinalitymin == 0 || cardinalitymin == null) && (cardinalitymax == null)){
            newResult = newResult.concat(" *");
          }
          else if((cardinalitymin == 1) && (cardinalitymax == null)){
            newResult = newResult.concat(" +");
          }
          else if((cardinalitymin == cardinalitymax) && (cardinalitymax != 0 && cardinalitymax != 1)){
            newResult = newResult.concat(" " + cardinalitymax);
          }
          else if((cardinalitymin != cardinalitymax) && (cardinalitymax != null)){
            newResult = newResult.concat(" {" + cardinalitymin + "," + cardinalitymax + "}");
          }
          else if((cardinalitymin != 0 && cardinalitymin != 1) && (cardinalitymax == null)) {
            newResult = newResult.concat(" {" + cardinalitymin + ",}");
          }
      
           
        }
      }
    }
    
    return newResult;
  }

  protected irify(root: StructureModelClassOrProperty) : string{
    var irifiedString : string;

    if(root.technicalLabel != null){
      irifiedString = root.technicalLabel.replaceAll(/\s/g,"");
    } else{
      irifiedString = "";
    }
    

    return irifiedString;
  }

  protected getIRIforShape(root: StructureModelClassOrProperty): string{
    var generatedIRI : string;
    const baseIRI = this.baseURL;
    var md5String = md5(root.cimIri);
    const technicalName = this.irify(root);
    const nodeOrProperty = "Shape";

    generatedIRI = baseIRI + md5String + "/" + technicalName + nodeOrProperty;

    return generatedIRI;
  }

  /**
   * Parse the IRI into tag:name and put known prefixes into array. Check for duplicates in tags.
   * @param iri IRI for the entity at hand
   * @returns Returns tuple QName = [tag,name]
   */
  prefixify(iri: string): QName {
    var qname : QName;
    var splitted = iri.split("/", 100); 
    var name = splitted[splitted.length-1];
    var prefix = iri.substring(0, iri.length - name.length);
    const found = this.knownPrefixes.find(obj => obj[1] === prefix);
    if( found != null){
      qname = [found[0], name];
      //this.debugString = this.debugString + "prefix v knownPrefixes nalezen " + qname + `\n`;
    } else{
      var splittedForTag = iri.split("www.", 100); 
      if(splittedForTag.length = 1){
        splittedForTag = iri.split("://", 100);
      }
      var newTagUnfinished = splittedForTag[1];
      var splitAgain = newTagUnfinished.split(".", 2);
      var fisrtPart= splitAgain[0];
      var newTag = fisrtPart.length < 4 ? fisrtPart.substring(0, fisrtPart.length) : fisrtPart.substring(0, 4);
      // Search for possible duplicates in known prefixes
      if(this.knownPrefixes.find(obj => obj[0] === newTag) != null){
        var tupleIndex = this.sameTags.findIndex(obj => obj[0] === newTag);
        if(tupleIndex == -1){
          this.sameTags.push([newTag,1]);
        } 
        tupleIndex = this.sameTags.findIndex(obj => obj[0] === newTag);
        newTag = newTag + this.sameTags[tupleIndex][1].toString();
        this.sameTags[tupleIndex][1] = this.sameTags[tupleIndex][1] + 1;
      }
      
      qname = [newTag, name];
      this.knownPrefixes.push([newTag,prefix]);
      /*this.debugString = this.debugString + "qname " + qname + `\n`;
      this.debugString = this.debugString + "knownPrefixes " + this.knownPrefixes + `\n`;
      this.debugString = this.debugString + "sameTags " + this.sameTags + `\n`;
      */
    }

    return qname;
  }


  protected registerClasses(root: StructureModelClass): void {
    // if the class is not in the list, add it
    if(this.classesUsedInStructure.indexOf(root.cimIri) == -1){
      this.classesUsedInStructure.push[root.cimIri];
      console.log(root.cimIri);
      //console.log(this.classesUsedInStructure);
    }
    for (const [i, prop] of root.properties.entries()) {
      for (var dt of prop.dataTypes) {
        if(dt.isAssociation() == true){
          const dtcasted = <StructureModelComplexType> dt;
          this.registerClasses(dtcasted.dataType);
        }
      }
    }
    //console.log(this.classesUsedInStructure);
  }
}
function isEmptyOrSpaces(str) : boolean{
  return str === null || str.match(/^ *$/) !== null;
}

// Types for specification in sh:datatype
const simpleTypeMapQName: Record<string, QName> = {
  [OFN.boolean]: ["xsd", "boolean"],
  [OFN.date]: ["xsd", "date"],
  [OFN.time]: ["xsd", "time"],
  [OFN.dateTime]: ["xsd", "dateTimeStamp"],
  [OFN.integer]: ["xsd", "integer"],
  [OFN.decimal]: ["xsd", "decimal"],
  [OFN.url]: ["xsd", "anyURI"],
  [OFN.string]: ["xsd", "string"],
  [OFN.text]: ["rdf", "langString"],
};

// Types for specification in sh:datatype
const simpleTypeMapIRI: Record<string, string> = {
  [OFN.boolean]: "http://www.w3.org/2001/XMLSchema#boolean",
  [OFN.date]: "http://www.w3.org/2001/XMLSchema#date",
  [OFN.time]: "http://www.w3.org/2001/XMLSchema#time",
  [OFN.dateTime]: "http://www.w3.org/2001/XMLSchema#dateTimeStamp",
  [OFN.integer]: "http://www.w3.org/2001/XMLSchema#integer",
  [OFN.decimal]: "http://www.w3.org/2001/XMLSchema#decimal",
  [OFN.url]: "http://www.w3.org/2001/XMLSchema#anyURI",
  [OFN.string]: "http://www.w3.org/2001/XMLSchema#string",
  [OFN.text]: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
};