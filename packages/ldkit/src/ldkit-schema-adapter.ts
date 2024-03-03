import { LdkitSchema, LdkitSchemaProperty, LdkitSchemaPropertyMap } from "./ldkit-schema-model";
import { StructureModelProperty } from "@dataspecer/core/structure-model/model/structure-model-property";
import { StructureModelComplexType, StructureModelPrimitiveType } from "@dataspecer/core/structure-model/model/structure-model-type";
import { assert } from "@dataspecer/core/core";
import { StructureModel } from "@dataspecer/core/structure-model/model/structure-model";
import { StructureModelClass } from "@dataspecer/core/structure-model/model/structure-model-class";

export interface StructureClassToSchemaAdapter {
    convertStructureModelToLdkitSchema(modelClass: StructureModel): LdkitSchema;
}

export class LdkitSchemaAdapter implements StructureClassToSchemaAdapter {

    convertAttributePropertyToLdkitProperty(attribute: StructureModelPrimitiveType, ldkitProperty: LdkitSchemaProperty): LdkitSchemaProperty {

        if (!attribute || !attribute.dataType) {
            // return without any change
            return ldkitProperty;
        }

        const multiLangDatatypeIri: string = "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text";

        if (attribute.dataType === multiLangDatatypeIri) {
            ldkitProperty["@multilang"] = true;
        }
        ldkitProperty["@type"] = attribute.dataType; // TODO: check what should be done, when number is used
        return ldkitProperty;
    }

    convertAssociationPropertyToLdkitProperty(association: StructureModelComplexType, ldkitProperty: LdkitSchemaProperty): LdkitSchemaProperty {
        if (!association || !association.dataType) {
            return ldkitProperty;
        }

        const nestedClass: StructureModelClass = association.dataType;
        ldkitProperty["@type"] = nestedClass.cimIri; // TODO: check ldkit documentation to see
        ldkitProperty["@schema"] = this.convertStructureModelClassToLdkitSchema(nestedClass);

        return ldkitProperty;
    }

    // TODO: generate property based on dataTypes - rewrite
    convertClassPropertyToLdkitProperty(classProperty: StructureModelProperty): string | LdkitSchemaProperty | readonly string[] {

        let ldkitProperty: LdkitSchemaProperty = {
            "@id": classProperty.cimIri,
        }

        if (!classProperty?.dataTypes || classProperty.dataTypes.length === 0) {
            throw new Error(`Property "${classProperty.humanLabel["en"]}" does not have a datatype.`);
        }

        if ((classProperty.cardinalityMin && classProperty.cardinalityMin !== 1) ||
            (classProperty.cardinalityMax && classProperty.cardinalityMax !== 1)) {
            // TODO: check condition on examples
            ldkitProperty["@array"] = true;
        }

        if (classProperty.cardinalityMin === 0) {
            // TODO: compre with ldkit definition of optional
            ldkitProperty["@optional"] = true;
        }

        classProperty.dataTypes.map(dataType => {
            if (dataType.isAttribute()) {
                ldkitProperty = this.convertAttributePropertyToLdkitProperty(dataType, ldkitProperty);
                return;
            }

            if (dataType.isAssociation()) {
                ldkitProperty = this.convertAssociationPropertyToLdkitProperty(dataType, ldkitProperty);
                return;
            }

            if (dataType.isCustomType()) {
                throw new Error("Custom type properties not supported yet");
            }
        });

        return Object.keys(ldkitProperty).length === 1
            ? classProperty.cimIri // only "@id" is there
            : ldkitProperty;
    }

    convertClassPropertiesToSchema(classProperties: StructureModelProperty[]): LdkitSchemaPropertyMap {

        const propertyMap: LdkitSchemaPropertyMap = {};

        classProperties.map(classProperty => {
            const propertyName: string = classProperty.technicalLabel;
            propertyMap[propertyName] = this.convertClassPropertyToLdkitProperty(classProperty);
        });

        return propertyMap;
    }

    convertStructureModelClassToLdkitSchema(modelClass: StructureModelClass): LdkitSchema {
        const propertyMap: LdkitSchemaPropertyMap = this.convertClassPropertiesToSchema(modelClass.properties);

        const result: LdkitSchema = {
            "@type": modelClass.cimIri ?? "",
            ...propertyMap
        };

        return result;
    }

    convertStructureModelToLdkitSchema(model: StructureModel): LdkitSchema {

        assert(model.roots.length === 1, "Exactly one root class must be provided.");

        if (model.roots[0].classes.length > 1) {
            throw new Error("Multiple root classes not supported yet");
        }

        const root: StructureModelClass = model.roots[0].classes[0];

        return this.convertStructureModelClassToLdkitSchema(root);
    }
}