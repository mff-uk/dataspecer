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
        4.7.1 sh:node - This would be useful if there is possible to put nodes inside nodes in dataspecer - is possible
        4.7.2 sh:property IN PROGRESS
        4.7.3 sh:qualifiedValueShape, sh:qualifiedMinCount, sh:qualifiedMaxCount
    4.8 Other Constraint Components -- TODO: Which of these are going to be a thing in dataspecer?
        4.8.1 sh:closed, sh:ignoredProperties - for DISCUSSION
        4.8.2 sh:hasValue - Is for checking specific values at the ends of paths = WILL NOT BE IMPLEMENTED
        4.8.3 sh:in - Is for checking specific values belonging to a list of options = WILL NOT BE IMPLEMENTED


*/

// Tuple type
type QName = [prefix: string | null, localName: string];
type PrefixDef = [tag: string, iri: string];
type sameTag = [tag: string, number: number];

const SHACL_PREFIX_DEF: PrefixDef = ["sh", "http://www.w3.org/ns/shacl#"];
const RDFS_PREFIX_DEF : PrefixDef = ["rdfs", "http://www.w3.org/2000/01/rdf-schema#"];

export class ShaclAdapter {
  
  
  protected model: StructureModel;
  protected context: ArtefactGeneratorContext;
  protected artefact: DataSpecificationArtefact;
  protected knownPrefixes: PrefixDef[] = []; // list of tags and corresponding IRIs
  protected shapes: string[] = []; // Entity beginning with name of the shape and ending with .
  protected debugString: string = "";
  protected sameTags: sameTag[] = [];

  constructor(
    model: StructureModel,
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact
  ) {
    this.model = model;
    this.context = context;
    this.artefact = artefact;
  }

  public generate = async () => {
    var result = "";
    this.getContext();
    
    if (this.model.roots.length > 1) {
      console.warn("SHACL generator: Multiple schema roots not supported yet.");
    }

    const rootClasses = this.model.roots[0].classes;
    // Iterate over all classes in root OR
    for (const root of rootClasses) {
      this.shapes.push(this.generateClassConstraints(root, result));
    }
    result = result + this.generatePrefixesString();
    result = result + this.getDataStructureContext();
    for(const part of this.shapes){
      result = result + part;
    }
    result = result + this.debugString;
    return { data: result };
  };

  generatePrefixesString(): string {
    var prefixesString = "";
    for(const tuple of this.knownPrefixes){
      prefixesString = prefixesString.concat(`@prefix ${ tuple[0] }: <${ tuple[1] }> .\n`);
    }
    return prefixesString;
  }

  generateClassConstraints(root: StructureModelClass, result: string): string {
    var newResult;
    newResult = result.concat("\n" + this.generateNodeShapeName(root));
    newResult = newResult.concat(this.generateNodeShapeHead(root));
    newResult = newResult.concat(this.generatePropertiesConstraints(root));
    return newResult;
  }

  generateNodeShapeHead(root: StructureModelClass): string {
    var head;
    head = "\n\ta sh:NodeShape ;";
    head =
      root.pimIri != null
        ? head.concat(`\n\tsh:targetClass <${root.pimIri}> ;`)
        : "";
    for (const languageTag in root.humanLabel) {
      const language = root.humanLabel[languageTag];
      head =
        root.humanLabel != null
          ? head.concat(`\n\trdfs:label \"${language}\"@${languageTag} ;`)
          : "";
    }
    for (const languageTag in root.humanDescription) {
      const language = root.humanDescription[languageTag];
      head =
        root.humanDescription != null
          ? head.concat(`\n\trdfs:comment \"${language}\"@${languageTag} ;`)
          : "";
    }
    //head = (root.pimIri != null) ? head.concat(`\n\trdfs:seeAlso <${ root.pimIri }> ;`) : "";
    return head;
  }

  /**
   * The function takes available description (technical or human label) and makes it camel case.
   * @param root
   * @returns Camel case name for the shape.
   */
  generateNodeShapeName(root: StructureModelClass): string {
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
    return capitalizedTechnicalLabel + "Shape";
  }

  generatePropertiesConstraints(root: StructureModelClass): string {
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

        // set up the inner property shape
        propDesc = propDesc.concat(`\n\tsh:property [`);
        // set up the path of the analyzed property
        const qnameForPath = this.prefixify(cimiri);
        propDesc = propDesc.concat(`\n\t\tsh:path ${ qnameForPath[0] }:${qnameForPath[1]};`);
        // if there is minimal cardinality needed, set it 
        if(cardinalitymin != null && cardinalitymin != 0){
          propDesc = propDesc.concat(`\n\t\tsh:minCount ${cardinalitymin} ;`);
        }
        // if there is maximal cardinality needed, set it 
        if(cardinalitymax != null){
          propDesc = propDesc.concat(`\n\t\tsh:maxCount ${cardinalitymax} ;`);
        }
        // set labels so that the user knows what is being checked
        for (const languageTag in humanLabel) {
          const language = humanLabel[languageTag];
          propDesc = propDesc.concat(
            `\n\t\tsh:name "${language}"@${languageTag} ;`
          );
        }
        // set descriptions if available
        for (const languageTag in humandesc) {
          const language = humandesc[languageTag];
          propDesc = propDesc.concat(
            `\n\t\tsh:description "${language}"@${languageTag} ;`
          );
        }
        // setting other properties according to the type of datatype
        for (var dt of datatypes) {
          if(dt.isAssociation() == true){
            // create new NodeShape and tie this property to it
            const dtcasted = <StructureModelComplexType> dt;
            propDesc = propDesc.concat(`\n\t\tsh:node ${ dtcasted.dataType } ;`);
            
          } else if(dt.isAttribute() == true){
            // If the datatype is set, try to match it to xsd datatypes. If unable, use its IRI.
            const dtcasted = <StructureModelPrimitiveType> dt;
            if(dtcasted.dataType != null){
              const datatypeFromMap = simpleTypeMapQName[dtcasted.dataType];
              var datatypeString = "";
              if(datatypeFromMap != undefined){
                datatypeString = `${datatypeFromMap[0]}:${datatypeFromMap[1]}`;
              } else{
                const datatypeInContext = this.prefixify(dtcasted.dataType);
                datatypeString = `${ datatypeInContext[0] }:${ datatypeInContext[1]}`;
              }
              propDesc = propDesc.concat(`\n\t\tsh:datatype ${ datatypeString } ;`);
              // Setting pattern restrictions if they exist
              if(dtcasted.regex != null){
                propDesc = propDesc.concat(`\n\t\tsh:pattern ${ dtcasted.regex } ;`);
              }
            }
            
          } /*else if(dt.isCustomType() == true){
            const dtcasted = <StructureModelCustomType> dt;
            propDesc = propDesc.concat(`\n\t\tsh:datatype ${ dtcasted.data } ;`);
          } else{
            throw new Error("Datatype must be one of the 3 basic types.");
          }
          */
        }
        //propDesc = propDesc.concat(`\n\t\tsh:datatype ${datatypes} ;`);
        /*
        propDesc = propDesc.concat(`\n\t\tdemat ${demat} ;`);
        propDesc = propDesc.concat(`\n\t\tisreverse ${isreverse} ;`);
        propDesc = propDesc.concat(`\n\t\tpathtoorigin ${pathtoorigin} ;`);
        */
        propDesc = propDesc.concat(`\n\t]`);
        // Check if the property is the last one in the properties list
        if (i === root.properties.length - 1) {
          propDesc = propDesc.concat(" .");
        } else {
          propDesc = propDesc.concat(" ;");
        }
      }
    }

    return propDesc;
  }

  protected getContext(): string {
    this.knownPrefixes.push(SHACL_PREFIX_DEF);
    this.knownPrefixes.push(RDFS_PREFIX_DEF);

    return "";
  }

  getDataStructureContext() : string {
    var structureContext = "";

    structureContext = structureContext + `\n${ this.model.specification }`;
    structureContext = structureContext + `\n${ this.model.psmIri }`;
    structureContext = structureContext + `\n${ this.model.humanDescription }`;
    structureContext = structureContext + `\n${ this.artefact.configuration }`;
    structureContext = structureContext + `\n structure models ${ this.context.structureModels }`;
    structureContext = structureContext + `\nspecifications ${ this.context.specifications }`;

    return structureContext;
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
    var prefix = iri.substring(0, iri.length - name.length - 1);
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
};
