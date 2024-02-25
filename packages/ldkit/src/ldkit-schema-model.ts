export type LdkitSchemaProperty = {
    "@id": string;
    "@type"?: string | number | boolean | Date;
    "@schema"?: LdkitSchema;
    "@optional"?: true;
    "@array"?: true;
    "@multilang"?: true;
}

export type LdkitSchemaPropertyMap = {
    [key: string]: LdkitSchemaProperty | string | readonly string[];
}

export type LdkitSchema = { "@type": string | readonly string[] } & LdkitSchemaPropertyMap;
