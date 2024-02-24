import { CatalogSchema } from "../schemas/catalog-schema";
import { DatasetSchema } from "../schemas/dataset-schema";
import * as catalogContext from "../data/context/catalogContext.json";
import * as datasetContext from "../data/context/datasetContext.json";
import { AggregateDefinitionProvider, AggregateIdentifier } from "./aggregate-data-provider-model";
import { LdkitSchemaProperty, LdkitSchemaPropertyMap } from "../ldkit-schema-model";
//import { JsonSchemaArray, JsonSchemaDefinition, JsonSchemaObject, JsonSchemaString } from "@dataspecer/json/json-schema/";

type SchemaObject = {
    $schema: string;
    title: string;
    description: string;
    type: string;
    required: string[];
    properties: object;
}

type ClassContext = {
    "@id": string,
    "@context": any
}

export class JsonSchemaDataProvider implements AggregateDefinitionProvider {

    private schemas: { [key: string]: SchemaObject };    //: { [key: string]: JsonSchemaDefinition };
    private contexts: { [key: string]: { "@context": object } };
    private currentAggregate: string;

    constructor(aggregateSubjectName: string) {
        this.schemas = {
            "catalog": CatalogSchema as unknown as SchemaObject,
            "dataset": DatasetSchema as unknown as SchemaObject
        }

        this.contexts = {
            "catalog": catalogContext,
            "dataset": datasetContext
        }

        this.currentAggregate = aggregateSubjectName;
    }

    private assertAggregateExists(aggregateName: string, context: object): boolean {
        if (!(aggregateName in context)) {
            throw new Error(`Schema for "${this.currentAggregate}" aggregate does not exist.`);
        }
        return true;
    }

    private getClassContextObject(context: object): ClassContext {

        const contextItems = Object.entries(context)
            // TODO: add others possible excluded -> goal is to only  leave the aggregate context
            .find(([contextKey, _]) => !(["@version", "xsd", "id", "type"].includes(contextKey)))

        if (!contextItems) {
            throw new Error("No context found");
        }

        const [contextClassName, classContext] = contextItems;
        return classContext;
    }

    getAggregateIdentifier(): AggregateIdentifier {

        const lowerCaseAggregateName: string = this.currentAggregate.toLowerCase();
        this.assertAggregateExists(lowerCaseAggregateName, this.schemas);
        this.assertAggregateExists(lowerCaseAggregateName, this.contexts);

        const aggregateName: string | undefined = this.schemas[lowerCaseAggregateName]?.title;
        //console.log(`Found name: "${aggregateName}"`);
        
        const matchingContextObject: { "@context": object; } | undefined = this.contexts[lowerCaseAggregateName];
        if (!matchingContextObject || !aggregateName) {
            throw new Error("");
        }

        //console.log("Found context: ", classContext);
        const classContext: ClassContext = this.getClassContextObject(matchingContextObject["@context"]);

        return {
            name: aggregateName,
            iri: classContext["@id"]
        } as AggregateIdentifier;
    }

    getAggregateProperties(): LdkitSchemaPropertyMap {
        const lowerCaseAggregateName: string = this.currentAggregate.toLowerCase();
        this.assertAggregateExists(lowerCaseAggregateName, this.schemas);

        const matchingSchemaObject = this.schemas[lowerCaseAggregateName]
        const matchingContextObject = this.contexts[lowerCaseAggregateName];
        if (!matchingContextObject || !matchingSchemaObject) {
            throw new Error("");
        }
        const classContext: ClassContext = this.getClassContextObject(matchingContextObject["@context"]);

        // if (!JsonSchemaObject.is(matchingDefinition)) {
        //     console.log(`This is not a JsonSchemaObject: `, matchingDefinition);
        //     console.log("Title: ", matchingDefinition.title);
        //     throw new Error("Not a JsonSchemaObject");
        // }

        const propertiesStructures = matchingSchemaObject.properties;
        const propertiesContexts = classContext["@context"];

        return this.generateSchemaPropertyMap(propertiesStructures, propertiesContexts);
    }

    generateSchemaPropertyMap(structures: object, propertiesContexts: { [key: string]: string | object }): LdkitSchemaPropertyMap {
        const propertyMap = {} as LdkitSchemaPropertyMap;

        Object.entries(structures)
            .filter(([propertyName, _]) => !(["id", "type"].includes(propertyName)))
            .map(([propertyName, propertyValue]) => {
                const propertyContext: string | object | undefined = propertiesContexts[propertyName];
                if (!propertyContext) {
                    throw new Error(`Context for property ${propertyName} does not exist!`);
                }

                // if (typeof propertyContext === "object") {
                //     // skip processing of more advanced objects for now
                //     // TODO: implement
                //     return;
                // }

                const generatedPropertyObject = this.generateSchemaPropertyObject(propertyContext);
                
                if (!generatedPropertyObject) {
                    return;
                }

                propertyMap[propertyName] = generatedPropertyObject;
            });

        return propertyMap;
    }

    generateSchemaPropertyObject(propertyContext: string | object): LdkitSchemaProperty | string | readonly string[] | null {
        switch (typeof propertyContext) {
            case "string":
                return propertyContext;
            case "object":
                return this.convertPropertyContextToLdkitSchemaProperty(propertyContext) ?? null;
            default:
                console.log("Unknown context yet: ", propertyContext);
                return null;
        }
    }

    private convertPropertyContextToLdkitSchemaProperty(propertyContext: any): LdkitSchemaProperty | null {
        
        if (!propertyContext["@id"]) {
            throw new Error("Property context without @id.");
        }

        if (propertyContext["@context"]) {
            return null;
        }

        const result: LdkitSchemaProperty = {
            "@id": propertyContext["@id"],
        };

        if (propertyContext["@container"] && propertyContext["@container"] === "@language") {
            result["@multilang"] = true;
        }

        if (propertyContext["@type"]) {
            result["@type"] = propertyContext["@type"];
        }

        return result;
    }
}