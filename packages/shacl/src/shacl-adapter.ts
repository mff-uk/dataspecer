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
import { OFN } from "@dataspecer/core/well-known";
//import { N3Deref } from 'n3';
//import { DataFactory as DataFactoryN3 } from 'n3';
//import { Writer as WriterN3 } from 'n3';
import * as N3 from "n3";
import { LanguageString } from "@dataspecer/core/core";
import md5 from "md5";

// SHACL version REC-shacl-20170720 - doesn't have official version with major.minor.bugfix
/*
Implementation notes
-----
According to the list of validatable properties for SHACL:
NodeShape - generated

Shapes and Constraints
        2.1.2 Focus Nodes - focus nodes are generated as the root classes of the structure
        2.1.3 Targets
            2.1.3.1 Node targets (sh:targetNode) - not used, only for single subject focusing, not for this kind of general data validation
            2.1.3.2 Class-based Targets (sh:targetClass) - base implemented. TODO: need to incorporate prefix generation and iri shortening
            2.1.3.3 Implicit Class Targets - not used atm but COULD be used instead of sh:targetClass
            2.1.3.4 Subjects-of targets (sh:targetSubjectsOf) - not used atm: we know what the subject exactly is and we want to work with that
            2.1.3.5 Objects-of targets (sh:targetObjectsOf) - not used atm: we know what the subject is and we dont need relative finding
        2.1.4 Declaring the Severity of a Shape - all shapes are BY DEFAULT sh:Violation
        2.1.5 Declaring Messages for a Shape - no message generating atm
        2.1.6 Deactivating a Shape - all shapes implicitly ACTIVATED

PropertyShape - not generated separately atm, is included in NodeShape

Core Constraint Components

    4.1 Value Type Constraint Components
        4.1.1 sh:class - TODO The type of all value nodes. The values of sh:class in a shape are IRIs. Note that multiple values for sh:class are 
        interpreted as a conjunction, i.e. the values need to be SHACL instances of all of them. 
        4.1.2 sh:datatype DONE
        4.1.3 sh:nodeKind TODO
    4.2 Cardinality Constraint Components
        4.2.1 sh:minCount DONE
        4.2.2 sh:maxCount DONE
    4.3 Value Range Constraint Components -- TODO: Is this a thing in dataspecer?
        4.3.1 sh:minExclusive WILL NOT BE IMPLEMENTED
        4.3.2 sh:minInclusive WILL NOT BE IMPLEMENTED
        4.3.3 sh:maxExclusive WILL NOT BE IMPLEMENTED
        4.3.4 sh:maxInclusive WILL NOT BE IMPLEMENTED
    4.4 String-based Constraint Components -- TODO: Which of these are going to be a thing in dataspecer? I have seen only pattern
        4.4.1 sh:minLength WILL NOT BE IMPLEMENTED
        4.4.2 sh:maxLength WILL NOT BE IMPLEMENTED
        4.4.3 sh:pattern - DONE
        4.4.4 sh:languageIn WILL NOT BE IMPLEMENTED
        4.4.5 sh:uniqueLang WILL NOT BE IMPLEMENTED
    4.5 Property Pair Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.5.1 sh:equals WILL NOT BE IMPLEMENTED
        4.5.2 sh:disjoint WILL NOT BE IMPLEMENTED
        4.5.3 sh:lessThan WILL NOT BE IMPLEMENTED
        4.5.4 sh:lessThanOrEquals WILL NOT BE IMPLEMENTED
    4.6 Logical Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.6.1 sh:not
        4.6.2 sh:and
        4.6.3 sh:or
        4.6.4 sh:xone
    4.7 Shape-based Constraint Components -- TODO Think about if this is going to be used
        4.7.1 sh:node - This would be useful if there is possible to put nodes inside nodes in dataspecer - is possible DONE
        4.7.2 sh:property DONE
        4.7.3 sh:qualifiedValueShape, sh:qualifiedMinCount, sh:qualifiedMaxCount
    4.8 Other Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.8.1 sh:closed, sh:ignoredProperties - for DISCUSSION
        4.8.2 sh:hasValue - Is for checking specific values at the ends of paths = WILL NOT BE IMPLEMENTED
        4.8.3 sh:in - Is for checking specific values belonging to a list of options = WILL NOT BE IMPLEMENTED
DONE použít knihovnu na vytváření .ttl dokumentu. 

TODO: zalamování sh:comments?
TODO: informace o celé datové struktuře - popis v rámci RDF tvrzení, které netvoří shape. - po diskuzi nebude implementováno.
TODO: dataspecer z nějakého důvodu modře přebarvuje kusy jmen, které jsou v namespace ofn - ofn:1643145411464-5579-b52f-9602 - myslí si, že je to matematický výraz. Tyto 
názvy nebudu používat - místo toho vložit cim.

*/

// Tuple type
type QName = [prefix: string | null, localName: string];
type PrefixDef = [tag: string, iri: string];
type sameTag = [tag: string, number: number];
type classNameShapeTuple = [classShapeName: string, classObject: StructureModelClass];
type StructureModelClassOrProperty = StructureModelClass | StructureModelProperty;

const SHACL_PREFIX_DEF: PrefixDef = ["sh", "http://www.w3.org/ns/shacl#"];
const RDFS_PREFIX_DEF : PrefixDef = ["rdfs", "http://www.w3.org/2000/01/rdf-schema#"];
//const N3 = require('n3');
const { DataFactory } = N3;
//const N3 = N3Deref;
const { namedNode, literal, defaultGraph, triple } = DataFactory;
//const { Writer } = WriterN3;
export class ShaclAdapter {
  
  
  protected model: StructureModel;
  protected context: ArtefactGeneratorContext;
  protected artefact: DataSpecificationArtefact;
  protected knownPrefixes: PrefixDef[] = []; // list of tags and corresponding IRIs
  protected shapes: string[] = []; // Entity beginning with name of the shape and ending with .
  protected debugString: string = "";
  protected sameTags: sameTag[] = [];
  protected sameClass: classNameShapeTuple[] = [];
  protected thisDataStructurePrefix : string = "";
  protected writer: any;
  protected scriptString: string = "";
  protected prefixesString: string = "";
  protected insidesString: string = "";

  constructor(
    model: StructureModel,
    context: ArtefactGeneratorContext | null,
    artefact: DataSpecificationArtefact
  ) {
    this.model = model;
    this.context = context;
    this.artefact = artefact;
    this.writer  = new N3.Writer({ prefixes: { sh: 'http://www.w3.org/ns/shacl#', rdfs: "http://www.w3.org/2000/01/rdf-schema#", ex:"https://example.org/" } }); 
  }

  public generate = async () => {
    
    if (this.model.roots.length > 1) {
      console.warn("SHACL generator: Multiple schema roots not supported yet.");
    }

    const rootClasses = this.model.roots[0].classes;
    // Iterate over all classes in root OR
    for (const root of rootClasses) {
      this.generateClassConstraints(root);
    }
    
    this.prefixesString = this.generatePrefixesString();
    for(const str of this.shapes){
      this.insidesString = this.insidesString.concat(str);
    }
    //this.scriptString = this.prefixesString + this.insidesString;
    this.scriptString = this.insidesString;
    //eval(this.scriptString);
    var resultString = "";
    this.writer.end((error, result) => resultString = result);
    return { data: resultString };
    //return { data: this.scriptString};
  };

  generatePrefixesString(): string {
    this.knownPrefixes.push(SHACL_PREFIX_DEF);
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

  generateClassConstraints(root: StructureModelClass): string {
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
      newResult = newResult.concat(this.generateNodeShapeHead(root, classNameIri));
      newResult = newResult.concat(this.generatePropertiesConstraints(root, classNameIri));

      this.shapes.push(newResult);
      this.sameClass.push([nodeName, root]);
    }
    return nodeName;
  }


  generateNodeShapeHead(root: StructureModelClass, classNameIri: string): string {

    var newResult = "";
    this.writer.addQuad(
      namedNode( classNameIri),
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/shacl#NodeShape')
    );
    this.writer.addQuad(
      namedNode( classNameIri),
      namedNode('http://www.w3.org/ns/shacl#targetClass'),
      namedNode( root.cimIri)
    );
    
    if(root.isClosed){
      const trueStatement = true;
      this.writer.addQuad(
          namedNode( classNameIri ),
          namedNode('http://www.w3.org/ns/shacl#closed'),
          literal(trueStatement)
        );
        this.writer.addQuad(
          namedNode( classNameIri ),
          namedNode('http://www.w3.org/ns/shacl#ignoredProperties'),
          this.writer.list([
            namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          ])
        );
    }

    this.generateLanguageString(root.humanDescription,classNameIri, null, "description");
    this.generateLanguageString(root.humanLabel,classNameIri, null, "name");
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
        const isreverse = prop.isReverse;
        const pathtoorigin = prop.pathToOrigin;
        
        //Create PropertyNode to connect to
        const nodeIRI = this.getIRIforShape(prop);

        this.writer.addQuad(
          namedNode( nodeIRI ),
          namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          namedNode('http://www.w3.org/ns/shacl#PropertyShape')
        );

        this.generateLanguageString(humandesc, nodeIRI, null, "description");
        this.generateLanguageString(humanLabel, nodeIRI, null, "name");

          if(cardinalitymin != 0 && cardinalitymin != null){
            this.writer.addQuad(
              namedNode( nodeIRI ),
              namedNode('http://www.w3.org/ns/shacl#minCount'),
              literal(cardinalitymin)
            );
          }

          if(cardinalitymax != 0 && cardinalitymax != null) {
            this.writer.addQuad(
              namedNode( nodeIRI ),
              namedNode('http://www.w3.org/ns/shacl#maxCount'),
              literal(cardinalitymax)
            );
          }

          this.writer.addQuad(
            namedNode( nodeIRI ),
            namedNode('http://www.w3.org/ns/shacl#path'),
            namedNode( cimiri )
          );

          // Add datatype for the PopertyNode
          // TODO
          this.getObjectForPropType(prop.dataTypes, nodeIRI);

          // Add property to the parent class
          this.writer.addQuad(
            namedNode(classNameIri),
            namedNode('http://www.w3.org/ns/shacl#property'),
            namedNode( nodeIRI ));
      }
    }
    
    return "returnFromPropertiesCreation";
  }

  protected getObjectForPropMin(min: number): string{
    if(min != 0 && min != null){
      return `{
        predicate: namedNode('http://www.w3.org/ns/shacl#minCount'),
        object:    literal(${min})
      },`
    } else {
      return "";
    }
  }

  protected getObjectForPropMax(max: number): any {
    if(max != 0 && max != null){
      return `{
        predicate: namedNode('http://www.w3.org/ns/shacl#maxCount'),
        object:    literal(${max})
      },`
    } else {
      return "";
    }
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
    // TODO 
    var baseIRI = "https://example.com/";
    
 
    //console.log(md5('message'));
    var md5String = md5(root.cimIri);
    const technicalName = this.irify(root);
    const nodeOrProperty = (root instanceof StructureModelClass) ? "NodeShape" : "PropertyShape";

    generatedIRI = baseIRI + md5String + "/" + technicalName + nodeOrProperty;

    return generatedIRI;
  }


  protected getObjectForPropType(datatypes: StructureModelType[], propertyNodeIRI: string): void {
    // setting other properties according to the type of datatype
    for (var dt of datatypes) {
      if(dt.isAssociation() == true){
        // create new NodeShape and tie this property to it if its not just an empty class
        
        const dtcasted = <StructureModelComplexType> dt;

        if(dtcasted.dataType.properties === undefined || dtcasted.dataType.properties.length == 0){
          this.writer.addQuad(
            namedNode( propertyNodeIRI ),
            namedNode('http://www.w3.org/ns/shacl#nodeKind'),
            namedNode( 'http://www.w3.org/ns/shacl#BlankNodeOrIRI' ));
        } else{
          const nameForAnotherClass = this.generateClassConstraints(dtcasted.dataType);
          const namedNodeString = this.prefixify(dtcasted.dataType.cimIri)[0] + ":" + nameForAnotherClass;
  
          var splitted = dtcasted.dataType.cimIri.split("/", 100); 
          var name = splitted[splitted.length-1];
          var prefix = dtcasted.dataType.cimIri.substring(0, dtcasted.dataType.cimIri.length - name.length);
          const shapeName = prefix + nameForAnotherClass;
          this.writer.addQuad(
            namedNode( propertyNodeIRI ),
            namedNode('http://www.w3.org/ns/shacl#node'),
            namedNode( shapeName ));
        }
        
        
      } else if(dt.isAttribute() == true){
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
            this.writer.addQuad(
              namedNode( propertyNodeIRI ),
              namedNode('http://www.w3.org/ns/shacl#datatype'),
              namedNode( simpleTypeMapIRI[dtcasted.dataType] ));
          } else{
            if(dtcasted.dataType != null){
              this.writer.addQuad(
                namedNode( propertyNodeIRI ),
                namedNode('http://www.w3.org/ns/shacl#datatype'),
                namedNode( dtcasted.dataType ));
          } 
          }
        
          /*
          propDesc = propDesc.concat(`\n\t\tsh:datatype ${ datatypeString } ;`);
          // Setting pattern restrictions if they exist
          if(dtcasted.regex != null){
            propDesc = propDesc.concat(`\n\t\tsh:pattern ${ dtcasted.regex } ;`);
          }
          */
        }
        
      } else if(dt.isCustomType() == true){
        // CUSTOM TYPE IS NOT USED AT THE MOMENT
        /*
        const dtcasted = <StructureModelCustomType> dt;
        if(dtcasted != null){
        blankNodes.push( {
          predicate: namedNode('http://www.w3.org/ns/shacl#datatype'),
          object:    namedNode('${ dtcasted.data}')
        });}
        */
        //propDesc = propDesc.concat(`\n\t\tsh:datatype ${ dtcasted.data } ;`);
      };
        //throw new Error("Datatype must be one of the 3 basic types.");
    }
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