/* DataT types currently known by DataSpecer */

// export const OFN = {
//     boolean: OFN_TYPE_PREFIX + "boolean",
//     date: OFN_TYPE_PREFIX + "datum",
//     time: OFN_TYPE_PREFIX + "čas",
//     dateTime: OFN_TYPE_PREFIX + "datum-a-čas",
//     integer: OFN_TYPE_PREFIX + "celé-číslo",
//     decimal: OFN_TYPE_PREFIX + "desetinné-číslo",
//     url: OFN_TYPE_PREFIX + "url",
//     string: OFN_TYPE_PREFIX + "řetězec",
//     text: OFN_TYPE_PREFIX + "text",
//     rdfLangString: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
//   };

/* Converts data types known by Dataspecer to regular data types */
export function convertDataTypeName(input: string): string | null {
    if (input) {
        switch (true) {
            case input.endsWith("boolean"):
                return "boolean";
            case input.endsWith("datum"):
                return "date";
            case input.endsWith("čas"):
                return "time";
            case input.endsWith("datum-a-čas"):
                return "dateTime";
            case input.endsWith("celé-číslo"):
                return "integer";
            case input.endsWith("desetinné-číslo"):
                return "decimal";
            case input.endsWith("url"):
                return "url";
            case input.endsWith("řetězec"):
                return "string";
            case input.endsWith("text"):
                return "string";
            case input.endsWith("http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"):
                return "string";
            default:
                return null;
        }
    }
    else
    {
        return "Object"
    }

}

/* Converts to data types accepted by OpenAPI */
export function convertToOpenAPIDataType(input: string): { type: string, format?: string } {
    switch (input) {
        case 'boolean':
            return { type: 'boolean' };
        case 'date':
            return { type: 'string', format: 'date' };
        case 'time':
            return { type: 'string', format: 'time' };
        case 'dateTime':
            return { type: 'string', format: 'date-time' };
        case 'integer':
            return { type: 'integer' };
        case 'decimal':
            return { type: 'number', format: 'double' };
        case 'url':
            return { type: 'string', format: 'uri' };
        case 'string':
        case 'text':
            return { type: 'string' };
        default:
            return { type: 'object' };
    }
}
