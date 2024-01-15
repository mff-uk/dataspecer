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