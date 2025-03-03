type SchemaPrototype = {
    [key: string]: ValidLdkitPropertyValueType | string | readonly string[];
};

type SchemaInterface = {
    [key: string]: string
}

type ValidLdkitPropertyValueType = {
    "@id": string;
    "@type"?: keyof SupportedDataTypes;
    "@schema"?: SchemaPrototype;
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
const SupportedDataTypesPrototype: { [key: string]: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor } = {
    "xsd.dateTime": Date,
    "xsd.date": Date,
    "xsd.gDay": Date,
    "xsd.gMonthDay": Date,
    "xsd.gYear": Date,
    "xsd.gYearMonth": Date,
    "xsd.boolean": Boolean,
    "xsd.double": Number,
    "xsd.decimal": Number,
    "xsd.float": Number,
    "xsd.integer": Number,
    "xsd.long": Number,
    "xsd.int": Number,
    "xsd.byte": Number,
    "xsd.short": Number,
    "xsd.negativeInteger": Number,
    "xsd.nonNegativeInteger": Number,
    "xsd.nonPositiveInteger": Number,
    "xsd.positiveInteger": Number,
    "xsd.unsignedByte": Number,
    "xsd.unsignedInt": Number,
    "xsd.unsignedLong": Number,
    "xsd.unsignedShort": Number,
    "xsd.string": String,
    "xsd.normalizedString": String,
    "xsd.anyURI": String,
    "xsd.base64Binary": String,
    "xsd.language": String,
    "xsd.Name": String,
    "xsd.NCName": String,
    "xsd.NMTOKEN": String,
    "xsd.token": String,
    "xsd.hexBinary": String,
    "rdf.langString": String,
};

export type SupportedDataTypes = typeof SupportedDataTypesPrototype;

export class ObjectModelTypeGeneratorHelper {

    public getInterfaceFromLdkitSchemaInstance(modelInstance: object): SchemaInterface {
        const transformed = Object.entries(modelInstance)
            .map(([key, value]) => {
                if (typeof value !== "string" && !isValidPropertyValue(value)) {
                    return [key, "never"] as [string, any];
                }

                return [key, this.inferPropertyValueType(value)] as [string, any];
            });

        const identifierTypeProperty = transformed.find(([key, _]) => key !== null && key !== undefined && key.toLowerCase() === "id");

        if (!identifierTypeProperty) {
            transformed.unshift(["id", "string | undefined"]);
        }

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

        // require a boolean value to be specified - avoid 3-state logic
        return value["@optional"] && (typeof resultType !== "boolean")
            ? `${resultType} | undefined`
            : resultType;
    }

    private convertValueAsType(value: ValidLdkitPropertyValueType): string | number | boolean | SchemaInterface | Date {
        if (isSchemaPrototype(value["@schema"])) {
            return this.getInterfaceFromLdkitSchemaInstance(value["@schema"]);
        }

        if (!value["@type"]) {
            return "string";
        }

        const typeValue = value["@type"] in SupportedDataTypesPrototype
            ? SupportedDataTypesPrototype[value["@type"]]!
            : String;

        return typeValue.name !== "Date"
            ? typeValue.name.toLowerCase()
            : typeValue.name;
    }
}
