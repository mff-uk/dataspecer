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

type ClassOrProperty = StructureModelClass | StructureModelProperty;

export function isTheSameEntity(root :ClassOrProperty, compared: ClassOrProperty): boolean {
    if(root instanceof StructureModelClass && compared instanceof StructureModelClass){
        return isTheSameClass(root, compared);
    } else if (root instanceof StructureModelProperty && compared instanceof StructureModelProperty){
        return isTheSameProperty(root, compared);
    } else {
        return false;
    }
}

function isTheSameProperty(property : StructureModelProperty, compared : StructureModelProperty): boolean {
    if(property.cardinalityMax != compared.cardinalityMax){
        return false;
    }
    if(property.cardinalityMin != compared.cardinalityMin){
        return false;
    }
    if(property.cimIri != compared.cimIri){
        return false;
    }
    if(property.dataTypes != compared.dataTypes){
        if(compared.dataTypes[0].isAssociation() && !property.dataTypes[0].isAssociation()) {
            return false;
        }
        if(compared.dataTypes[0].isAttribute() && !property.dataTypes[0].isAttribute()) {
            return false;
        }
        if(compared.dataTypes[0].isCustomType() && !property.dataTypes[0].isCustomType()) {
            return false;
        }
        if(compared.dataTypes[0].isAssociation()) {
            const castedComparedTo = <StructureModelComplexType> compared.dataTypes[0];
            const castedComparator = <StructureModelComplexType> property.dataTypes[0];
            if(!isTheSameEntity(castedComparator.dataType, castedComparedTo.dataType)){
                return false;
            }
            
        }
        if(compared.dataTypes[0].isAttribute() && !property.dataTypes[0].isAttribute()) {
            const castedComparedTo = <StructureModelPrimitiveType> compared.dataTypes[0];
            const castedComparator = <StructureModelPrimitiveType> property.dataTypes[0];
            if((castedComparator.regex != castedComparedTo.dataType) || (castedComparator.regex != castedComparedTo.regex)){
                return false;
            }
            
        }
        // TODO for customType
        
    }
    if(property.dematerialize != compared.dematerialize){
        return false;
    }
    if(property.humanDescription != compared.humanDescription){
        return false;
    }
    if(property.humanLabel != compared.humanLabel){
        return false;
    }
    if(property.isReverse != compared.isReverse){
        return false;
    }
    if(property.pathToOrigin != compared.pathToOrigin){
        return false;
    }
    if(property.technicalLabel != compared.technicalLabel){
        return false;
    }
    if(property.pimIri != compared.pimIri){
        return false;
    }
    return true;
}

function isTheSameClass(cl : StructureModelClass, compared : StructureModelClass): boolean {
    if(cl.cimIri != compared.cimIri){
        return false;
    }
    if(cl.codelistUrl != compared.codelistUrl){
        return false;
    }
    if(cl.example != compared.example){
        return false;
    }
    if(cl.extends != compared.extends){
        return false;
    }
    if(cl.humanDescription != compared.humanDescription){
        return false;
    }
    if(cl.humanLabel != compared.humanLabel){
        return false;
    }
    if(cl.instancesHaveIdentity != compared.instancesHaveIdentity){
        return false;
    }
    if(cl.instancesSpecifyTypes != compared.instancesSpecifyTypes){
        return false;
    }
    if(cl.isClosed != compared.isClosed){
        return false;
    }
    if(cl.isCodelist != compared.isCodelist){
        return false;
    }
    if(cl.isReferenced != compared.isReferenced){
        return false;
    }
    if(cl.objectExample != compared.objectExample){
        return false;
    }
    if(cl.pimIri != compared.pimIri){
        return false;
    }
    /*
    if(cl.properties != compared.properties){
        for (const propertyComparedTo of compared.properties) {
            if(isTheSameProperty(prop))
        }
        // TODO
        return false;
    }
    */
    if(cl.regex != compared.regex){
        return false;
    }
    if(cl.specification != compared.specification){
        return false;
    }
    if(cl.structureSchema != compared.structureSchema){
        return false;
    }
    if(cl.technicalLabel != compared.technicalLabel){
        return false;
    }
    return true;

}

export async function prependPrefixes(recordOfDataAndPrefixes : Record<string, Record<string, string>>): Promise<string>{
    var data = "";
    var prefixes = {};
    var prefixesString = "";

    for(var key in recordOfDataAndPrefixes){
        data = key;
        prefixes = recordOfDataAndPrefixes[key];
        console.log("Setup in prependPrefixes ");
    }

    for(var key in prefixes ){
        prefixesString = prefixesString.concat("prefix " + key + ": <" + prefixes[key] + ">\n");
        console.log("prefixesString in prependPrefixes " + prefixesString);
    }

    prefixesString = prefixesString.concat("\n");

    return prefixesString + data;
}

export function prefixifyFinalOutput(data : string, base: string): Record<string, Record<string, string>>{
    var prefixifiedString = data;
    if(base != undefined && base != null && base != ""){
        usualPrefixes["base"] = base;
    }

    var prefixes = recognizeStandardPrefixes(data);
    
    prefixifiedString = prefixifyString(data, prefixes);

    const result: Record<string,Record<string, string>> = {};
    result[prefixifiedString] = prefixes;
    return result;
}

function recognizeStandardPrefixes(data : string): Record<string, string>{
    var prefixes :Record<string, string> = {}; 

    for(var key in usualPrefixes){
        if(data.search(usualPrefixes[key]) != -1){
            prefixes[key] = usualPrefixes[key];
        }      
    }
    for(var key in prefixes){
        console.log("prvek z prefixoveho pole " + key + ":" + prefixes[key]);
    }
       
   

    return prefixes;
}

function prefixifyString(data : string, prefixes: Record<string, string>): string{
    var prefixifiedString = data; 
    
    for(var key in prefixes){
        prefixifiedString = prefixifiedString.replaceAll(/<[^<>]+>/g,function(match,offset,param2) {
            //console.log("match = " + match);
            //console.log("offset = " + offset);
            //console.log("allString = " + param2); 
            var prefixified = "";
            if(match.search(prefixes[key]) != -1){
                prefixes[key].length
                prefixified = key + ":" + match.substring((prefixes[key].length)+1, (match.length)-1);
            } else {
                prefixified = match;
            }
            return prefixified;
            }
        );
    }
    console.log("prefixified string: " + prefixifiedString);
    return prefixifiedString;
}

// Usual prefixes that can be seen in types/predicates
const usualPrefixes: Record<string, string> = {
    ["rdf"]: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    ["dc"]: "http://purl.org/dc/elements/1.1/",
    ["foaf"]: "http://xmlns.com/foaf/0.1/",
    ["rdfs"]: "http://www.w3.org/2000/01/rdf-schema#",
    ["xsd"]: "http://www.w3.org/2001/XMLSchema#",
    ["owl"]: "http://www.w3.org/2002/07/owl#",
    ["vann"]: "http://purl.org/vocab/vann/",
    ["cc"]: "http://web.resource.org/cc/",
    ["vs"]: "http://www.w3.org/2003/06/sw-vocab-status/ns#",
    ["wot"]: "http://xmlns.com/wot/0.1/",
    ["geo"]: "http://www.w3.org/2003/01/geo/wgs84_pos#",
  };