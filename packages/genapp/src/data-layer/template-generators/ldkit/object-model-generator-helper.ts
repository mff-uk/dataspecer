type SchemaPrototype = {
    [key: string]: ValidLdkitPropertyValueType | string | readonly string[];
};

type SchemaInterface = {
    [key: string]: string
}

type ValidLdkitPropertyValueType = {
    "@id": string;
    "@type"?: keyof SupportedDataTypes;
    "@context"?: SchemaPrototype;
    "@optional"?: true;
    "@array"?: true;
    "@multilang"?: true;
};

function isSchemaPrototype(obj: any): obj is SchemaPrototype {
    return (obj as { "@context": SchemaPrototype }) !== undefined;
}

function isValidPropertyValue(obj: any): obj is ValidLdkitPropertyValueType {
    return obj as ValidLdkitPropertyValueType !== undefined;
}


/**
* Taken from ldkit library
*/
declare const SupportedDataTypesPrototype: {
    "xsd:dateTime": Date;
    "xsd:date": Date;
    "xsd:gDay": Date;
    "xsd:gMonthDay": Date;
    "xsd:gYear": Date;
    "xsd:gYearMonth": Date;
    "xsd:boolean": boolean;
    "xsd:double": number;
    "xsd:decimal": number;
    "xsd:float": number;
    "xsd:integer": number;
    "xsd:long": number;
    "xsd:int": number;
    "xsd:byte": number;
    "xsd:short": number;
    "xsd:negativeInteger": number;
    "xsd:nonNegativeInteger": number;
    "xsd:nonPositiveInteger": number;
    "xsd:positiveInteger": number;
    "xsd:unsignedByte": number;
    "xsd:unsignedInt": number;
    "xsd:unsignedLong": number;
    "xsd:unsignedShort": number;
    "xsd:string": string;
    "xsd:normalizedString": string;
    "xsd:anyURI": string;
    "xsd:base64Binary": string;
    "xsd:language": string;
    "xsd:Name": string;
    "xsd:NCName": string;
    "xsd:NMTOKEN": string;
    "xsd:token": string;
    "xsd:hexBinary": string;
    "rdf:langString": string;
};

export type SupportedDataTypes = typeof SupportedDataTypesPrototype;


export class ObjectModelTypeGeneratorHelper {

    public getInterfaceFromLdkitSchemaInstance(modelInstance: object): SchemaInterface {
        const transformed = Object.entries(modelInstance)
            .map(([key, value]) => {
                if (typeof value !== "string" && !isValidPropertyValue(value)) {
                    return [key, "never"];
                }

                return [key, this.inferPropertyValueType(value)];
            });

        const schemaInterfaceResult = Object.fromEntries(transformed);

        return schemaInterfaceResult;
    }

    private inferPropertyValueType(value: string | ValidLdkitPropertyValueType) {
        if (typeof value === "string") {
            return "string";
        }

        const resultType = this.convertValueAsArrayType(value);

        return value["@multilang"]
            ? `Record<string, ${resultType}>`
            : resultType;
    }

    private convertValueAsArrayType(value: ValidLdkitPropertyValueType) {
        if (value["@array"]) {
            const arrayValueType = this.convertValueAsType(value);

            return typeof arrayValueType === "object"
                ? `${JSON.stringify(arrayValueType)}[]`
                : `${arrayValueType}[]`;
        }

        return this.convertValueAsOptionalType(value);
    }

    private convertValueAsOptionalType(value: ValidLdkitPropertyValueType) {

        const valueType = this.convertValueAsType(value);

        const resultType = typeof valueType === "object"
            ? JSON.stringify(valueType)
            : valueType;

        return value["@optional"]
            ? `${resultType} | undefined`
            : resultType;
    }

    private convertValueAsType(value: ValidLdkitPropertyValueType): string | number | boolean | SchemaInterface | Date {
        if (isSchemaPrototype(value["@context"])) {
            return this.getInterfaceFromLdkitSchemaInstance(value["@context"]);
        }

        if (!value["@type"]) {
            return "string";
        }

        return value["@type"] in SupportedDataTypesPrototype
            ? SupportedDataTypesPrototype[value["@type"]]
            : "string";
    }
}
