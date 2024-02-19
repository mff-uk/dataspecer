import { CatalogSchema } from "../schemas/catalog-schema";
import { DatasetSchema } from "../schemas/dataset-schema";
import * as catalogContext from "../data/context/catalogContext.json";
import * as datasetContext from "../data/context/datasetContext.json";
import { AggregateDefinitionProvider, AggregateIdentifier } from "./aggregate-data-provider-model";
import { LdkitSchemaProperty, LdkitSchemaPropertyMap } from "../ldkit-schema-model";
//import { JsonSchemaArray, JsonSchemaDefinition, JsonSchemaObject, JsonSchemaString } from "@dataspecer/json/json-schema/";

export class JsonSchemaDataProvider implements AggregateDefinitionProvider {

    private schemas;    //: { [key: string]: JsonSchemaDefinition };
    private contexts;
    private currentAggregate: string;

    constructor(aggregateSubjectName: string) {
        this.schemas = {
            "catalog": CatalogSchema as unknown, // as JsonSchemaObject,
            "dataset": DatasetSchema as unknown  //as JsonSchemaObject
        }

        this.contexts = {
            "catalog": catalogContext,
            "dataset": datasetContext
        }

        this.currentAggregate = aggregateSubjectName;
    }

    private assertAggregateExists(aggregateName: string, context): boolean {
        if (!(aggregateName in context)) {
            throw new Error(`Schema for "${this.currentAggregate}" aggregate does not exist.`);
        }
        return true;
    }

    private getClassContextObject(context) {

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

        const aggregateName: string = this.schemas[lowerCaseAggregateName].title;
        //console.log(`Found name: "${aggregateName}"`);

        const matchingContextObject = this.contexts[lowerCaseAggregateName];
        const classContext = this.getClassContextObject(matchingContextObject["@context"]);
        //console.log("Found context: ", classContext);

        return {
            name: aggregateName,
            iri: classContext["@id"]
        } as AggregateIdentifier;
    }

    getAggregateProperties(): LdkitSchemaPropertyMap {
        const lowerCaseAggregateName: string = this.currentAggregate.toLowerCase();
        this.assertAggregateExists(lowerCaseAggregateName, this.schemas);

        const matchingSchemaObject /*: JsonSchemaObject */ = this.schemas[lowerCaseAggregateName]// as JsonSchemaObject;
        const matchingContextObject = this.contexts[lowerCaseAggregateName];
        const classContext = this.getClassContextObject(matchingContextObject["@context"]);

        // if (!JsonSchemaObject.is(matchingDefinition)) {
        //     console.log(`This is not a JsonSchemaObject: `, matchingDefinition);
        //     console.log("Title: ", matchingDefinition.title);
        //     throw new Error("Not a JsonSchemaObject");
        // }

        const propertiesStructures = matchingSchemaObject.properties;
        const propertiesContexts = classContext["@context"];

        return this.generateSchemaPropertyMap(propertiesStructures, propertiesContexts);
    }

    generateSchemaPropertyMap(structures /*: { [name: string]: JsonSchemaDefinition; }*/, propertiesContexts): LdkitSchemaPropertyMap {
        const propertyMap = {} as LdkitSchemaPropertyMap;

        Object.entries(structures)
            .filter(([propertyName, _]) => !(["id", "type"].includes(propertyName)))
            .map(([propertyName, propertyValue]) => {
                const propertyContext: string | object = propertiesContexts[propertyName];
                if (!propertyContext) {
                    throw new Error(`Context for property ${propertyName} does not exist!`);
                }

                // if (typeof propertyContext === "object") {
                //     // skip processing of more advanced objects for now
                //     // TODO: implement
                //     return;
                // }

                const generatedPropertyObject = this.generateSchemaPropertyObject([propertyName, propertyValue], propertyContext);
                
                if (!generatedPropertyObject) {
                    return;
                }

                propertyMap[propertyName] = generatedPropertyObject;
            });

        return propertyMap;
    }

    generateSchemaPropertyObject([propertyName, propertyStructure] /*: [string, JsonSchemaDefinition]*/, propertyContext): LdkitSchemaProperty | string | readonly string[] {
        // TODO: propertyName a propertyValue su hodnoty zo strukturalneho modelu / z JSON schematu
        // postavit ten LdkitSchemaProperty objekt na zaklade struktury ako aj kontextu
        // - ak je kontext pre danu property iba string -> da sa vytvorit jednoduchy objekt, pripadne pozriet do struktury ci to je array
        // - ak je kontext zlozitejsi, pravdepodobne pojde o zlozitejsi objekt -> mozno necham na neskor

        // console.log(`Prop name: "${propertyName}"`);
        // console.log("Property Value: ", propertyStructure);
        // console.log("Property context: ", propertyContext);

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

    private convertPropertyContextToLdkitSchemaProperty(propertyContext: object): LdkitSchemaProperty {
        
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