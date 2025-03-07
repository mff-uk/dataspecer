import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateModel } from "../../engine/templates/template-interfaces";
import { Schema } from "ts-json-schema-generator";
import { TemplateDependencyMap } from "../../engine/templates/template-consumer";
import { PresentationLayerTemplateGenerator } from "./presentation-layer-template-generator";
import { AggregateMetadata } from "../../application-config";

interface DataJsonSchemaTemplate extends TemplateModel {
    /** @inheritdoc */
    placeholders: {
        schema_name: string,
        json_schema: string
    }
}

export class DataJsonSchemaTemplateProcessor extends PresentationLayerTemplateGenerator<DataJsonSchemaTemplate> {

    private static readonly _dataSchemaTemplatePath: string = "./common/presentation-layer/data-json-schema";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: DataJsonSchemaTemplateProcessor._dataSchemaTemplatePath
        })
    }

    generateUISchema(aggregate: AggregateMetadata): Schema {

        const dataSchema = this.restoreAggregateDataModelInterface(aggregate);

        if (!dataSchema || !dataSchema.definitions) {
            return {};
        }

        const schema = Object.values(dataSchema.definitions).at(0) ?? {};
        return this.traverseSchema(schema);
    }

    private traverseSchema(schema: any): object {
        if (!schema || typeof schema !== "object") return {};

        let result: any = {};

        const properties = schema.properties || {};

        Object.entries(properties)
            .forEach(([key, value]: [any, any]) => {
                if (value.type === "array" && value.items?.type === "object") {
                    const arrayItems = this.traverseSchema(value.items);
                    if (Object.keys(arrayItems).length > 0) {
                        result[key] = { items: arrayItems };
                    }
                    return;
                }

                if (value.type === "object") {
                    const nested = this.traverseSchema(value);
                    if (Object.keys(nested).length > 0) {
                        result[key] = nested;
                    }
                    return;
                }

                if (value.type === "boolean") {
                    result[key] = { "ui:widget": "radio" };
                    return;
                }
            });

        if ("id" in properties && Object.keys(properties).length > 1) {
            result["id"] = { "ui:widget": "hidden" };
        }

        return result;
    }

    async processTemplate(dependencies: TemplateDependencyMap): Promise<LayerArtifact> {

        const dataSchemaInterface = this.restoreAggregateDataModelInterface(dependencies.aggregate);
        const dataSchemaName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "JsonSchema"
        })

        const dataSchemaTemplate: DataJsonSchemaTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                json_schema: JSON.stringify(dataSchemaInterface, null, 2),
                schema_name: dataSchemaName
            }
        }

        const dataSchemaRender = this._templateRenderer.renderTemplate(dataSchemaTemplate);
        const dataSchemaArtifact: LayerArtifact = {
            filePath: this._filePath,
            exportedObjectName: dataSchemaName,
            sourceText: dataSchemaRender,
            dependencies: []
        }

        return dataSchemaArtifact;
    }
}
