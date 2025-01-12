import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/templates/template-consumer";
import { BaseListLdkitReaderGenerator } from "./base-list-reader-generator";
import { DataLayerTemplateDescription, ImportRelativePath } from "../../../engine/templates/template-interfaces";
import { LdkitDalDependencyMap } from "../../strategies/ldkit-template-strategy";
import { ReadWriteEndpointUri } from "../../../engine/graph/datasource";

/**
 * Describes the template model for generating an aggregate-specific LDkit list reader implementation.
 *
 * @interface InstanceListLdkitReaderTemplate
 */
export interface InstanceListLdkitReaderTemplate extends DataLayerTemplateDescription {
    /** @inheritdoc */
    placeholders: {
        ldkit_list_reader_base_class: string,
        ldkit_list_reader_base_class_path: ImportRelativePath,
        ldkit_schema: string,
        ldkit_schema_path: ImportRelativePath,
        aggregate_name: string,
        ldkit_endpoint_uri: string
    };
}

/** @ignore */
function isInstanceListLdkitReaderDependencyList(obj: TemplateDependencyMap): obj is LdkitDalDependencyMap {
    return (obj as LdkitDalDependencyMap) !== undefined;
}

/**
 * The `InstanceListLdkitReaderGenerator` class is responsible for generating the aggregate-specific implementation
 * part of the list capability using the LDkit library. This class provides specific logic for template population
 * and generation of dependencies needed for the data layer of the list capability of the generated application.
 *
 * @extends TemplateConsumer<InstanceListLdkitReaderTemplate>
 */
export class InstanceListLdkitReaderGenerator extends TemplateConsumer<InstanceListLdkitReaderTemplate> {

    private static readonly _ldkitListDataLayerTemplatePath = "./list/data-layer/ldkit/aggregate-specific-reader";

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: InstanceListLdkitReaderGenerator._ldkitListDataLayerTemplatePath
        });
    }

    /**
     * This method is responsible for the population and rendering of the template for aggregate-specific implementation part of the list capability.
     * When all dependencies needed by template (@see {InstanceListLdkitReaderTemplate} for more details) are populated,
     * the template renderer is invoked to generate the resulting code.
     *
     * @param dependencies - Dependencies providing the information about the aggregate and context for the template.
     * @returns A promise that resolves to the generated aggregate-specific implementation for list capability.
     * @throws {Error} If the dependencies list parameter is invalid.
     */
    async processTemplate(dependencies: LdkitDalDependencyMap): Promise<LayerArtifact> {

        if (!dependencies || !isInstanceListLdkitReaderDependencyList(dependencies)) {
            throw new Error("Invalid dependencies list parameter.");
        }

        const baseLdkitListReaderArtifact = await new BaseListLdkitReaderGenerator().processTemplate();
        const listExportedObject = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "LdkitListReader"
        });

        const readSparqlEndpointUri = typeof dependencies.sparqlEndpointUri === "string"
            ? dependencies.sparqlEndpointUri
            : (dependencies.sparqlEndpointUri as ReadWriteEndpointUri).read;

        const instanceListLdkitReaderTemplate: InstanceListLdkitReaderTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                aggregate_name: listExportedObject,
                ldkit_endpoint_uri: `"${readSparqlEndpointUri}"`,
                ldkit_schema: dependencies.ldkitSchemaArtifact.exportedObjectName,
                ldkit_list_reader_base_class: baseLdkitListReaderArtifact.exportedObjectName,
                ldkit_list_reader_base_class_path: {
                    from: this._filePath,
                    to: baseLdkitListReaderArtifact.filePath
                },
                ldkit_schema_path: {
                    from: this._filePath,
                    to: dependencies.ldkitSchemaArtifact.filePath
                }
            }
        };

        const ldkitInstanceListReader: string = this._templateRenderer.renderTemplate(instanceListLdkitReaderTemplate);

        const readerInterfaceArtifact: LayerArtifact = {
            sourceText: ldkitInstanceListReader,
            exportedObjectName: listExportedObject,
            filePath: this._filePath,
            dependencies: [baseLdkitListReaderArtifact, dependencies.ldkitSchemaArtifact, dependencies.ldkitSchemaInterfaceArtifact]
        }

        return readerInterfaceArtifact;
    }
}