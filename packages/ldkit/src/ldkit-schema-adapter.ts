import { LdkitSchema, LdkitSchemaProperty, LdkitSchemaPropertyMap } from "./ldkit-schema-model";
import { StructureModelProperty } from "@dataspecer/core/structure-model/model/structure-model-property";
import { StructureModelComplexType, StructureModelPrimitiveType } from "@dataspecer/core/structure-model/model/structure-model-type";
import { assert } from "@dataspecer/core/core";
import { StructureModel } from "@dataspecer/core/structure-model/model/structure-model";
import { StructureModelClass } from "@dataspecer/core/structure-model/model/structure-model-class";
import { xsd, rdf } from "ldkit/namespaces";

export interface StructureClassToSchemaAdapter {
    convertStructureModelToLdkitSchema(modelClass: StructureModel): LdkitSchema;
}

export class LdkitSchemaAdapter implements StructureClassToSchemaAdapter {

    convertAttributeDataTypeToLdkitSupportedDataType<T>(dataTypeIri: string): keyof T {
        const map: { [k: string]: any } = {
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/boolean": "xsd.boolean",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/datum": "xsd.date",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/datum-a-čas": "xsd.dateTime",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/celé-číslo": "xsd.integer",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/desetinné-číslo": "xsd.decimal",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/url": "xsd.anyURI",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/řetězec": "xsd.string",
            "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/text":  "rdf.langString"
        }

        return map[dataTypeIri] ?? "xsd.string";
    }

    convertAttributePropertyToLdkitProperty(attribute: StructureModelPrimitiveType, ldkitProperty: LdkitSchemaProperty): LdkitSchemaProperty {

        if (!attribute || !attribute.dataType) {
            // return without any change
            return ldkitProperty;
        }

        const multiLangDatatypeIri: string = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

        if (attribute.dataType === multiLangDatatypeIri) {
            ldkitProperty["@multilang"] = true;
        }
        //ldkitProperty["@type"] = this.convertAttributeDataTypeToLdkitSupportedDataType(attribute.dataType);
        return ldkitProperty;
    }

    convertAssociationPropertyToLdkitProperty(association: StructureModelComplexType, ldkitProperty: LdkitSchemaProperty): LdkitSchemaProperty {
        if (!association || !association.dataType) {
            return ldkitProperty;
        }

        const nestedClass: StructureModelClass = association.dataType;
        //ldkitProperty["@type"] = xsd.string; //this.convertDataTypeToLdkitSupportedDataType(association); //nestedClass.cimIri;
        ldkitProperty["@schema"] = this.convertStructureModelClassToLdkitSchema(nestedClass);

        return ldkitProperty;
    }

    setCardinalityRelatedProperties(cardMin: number | null, cardMax: number | null, property: LdkitSchemaProperty): void {

        if (!cardMax || !cardMin) {
            // cardMax is null == no upper bound == array expected
            property["@array"] = true;
            property["@optional"] = true;
            return;
        }

        if (cardMax < cardMin) {
            throw new Error("Invalid cardinality on property");
        }

        if (cardMin === 0) {
            property["@optional"] = true;
            return;
        }

        if (cardMax > 1) {
            property["@array"] = true;
        }
    }

    // TODO: generate property based on dataTypes - rewrite
    convertClassPropertyToLdkitProperty(classProperty: StructureModelProperty): string | LdkitSchemaProperty | readonly string[] {

        if (!classProperty.cimIri) {
            throw new Error("Missing class property conceptual IRI");
        }

        let ldkitProperty: LdkitSchemaProperty = {
            "@id": classProperty.cimIri,
        }

        if (!classProperty?.dataTypes || classProperty.dataTypes.length === 0) {
            throw new Error(`Property does not have a datatype.`);
        }

        this.setCardinalityRelatedProperties(classProperty.cardinalityMin, classProperty.cardinalityMax, ldkitProperty);

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
            ? classProperty.cimIri
            : ldkitProperty;
    }

    convertClassPropertiesToSchema(classProperties: StructureModelProperty[]): LdkitSchemaPropertyMap {

        const propertyMap: LdkitSchemaPropertyMap = {};

        classProperties.map(classProperty => {
            const propertyName: string = classProperty.technicalLabel!;
            propertyMap[propertyName] = this.convertClassPropertyToLdkitProperty(classProperty);
        });

        return propertyMap;
    }

    convertStructureModelClassToLdkitSchema(modelClass: StructureModelClass): LdkitSchema {
        const propertyMap: LdkitSchemaPropertyMap = this.convertClassPropertiesToSchema(modelClass.properties);

        if (!modelClass.cimIri) {
            throw new Error("Conceptual type of class is mandatory");
        }

        const result: LdkitSchema = {
            "@type": modelClass.cimIri,
            ...propertyMap
        };

        return result;
    }

    convertStructureModelToLdkitSchema(model: StructureModel): LdkitSchema {

        assert(model.roots.length === 1, "Exactly one root class must be provided.");

        if (model.roots[0]!.classes.length !== 1) {
            throw new Error("Root classes number other than 1 is not supported yet");
        }

        const root: StructureModelClass = model.roots[0]!.classes[0]!;

        return this.convertStructureModelClassToLdkitSchema(root);
    }
}