import { ImportRelativePath, DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/templates/template-consumer";
import { ArtifactCache } from "../../../utils/artifact-saver";
import { ObjectModelTypeGeneratorHelper } from "./object-model-generator-helper";

interface LdkitObjectModelTypeTemplate extends DataLayerTemplateDescription {
    placeholders: {
        object_model_type: object;
        object_model_type_name: string;
    }
}

interface LdkitObjectModelDependencyMap extends TemplateDependencyMap {
    ldkitSchemaArtifact: LayerArtifact
}

export class LdkitObjectModelTypeGenerator extends TemplateConsumer<LdkitObjectModelTypeTemplate> {

    private readonly _generatorHelper: ObjectModelTypeGeneratorHelper;

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: `./list/data-layer/ldkit/object-model-type`
        });

        this._generatorHelper = new ObjectModelTypeGeneratorHelper();
    }

    private getSerializedLdkitSchema(ldkitSchemaSource: string): string {
        const objectStartIndex = ldkitSchemaSource.indexOf("{");
        const objectEndIndex = ldkitSchemaSource.indexOf(" as const;");

        return ldkitSchemaSource.substring(objectStartIndex, objectEndIndex);
    }

    private generateAndSaveLdkitSchemaInterface(ldkitArtifact: LayerArtifact, aggregateTechnicalLabel: string) {
        const ldkitSchemaInstance = JSON.parse(this.getSerializedLdkitSchema(ldkitArtifact.sourceText));

        const ldkitSchemaInterface = this._generatorHelper.getInterfaceFromLdkitSchemaInstance(ldkitSchemaInstance);

        ArtifactCache.content[`__${aggregateTechnicalLabel}DataModelInterface`] = JSON.stringify(ldkitSchemaInterface);

        return ldkitSchemaInterface;
    }

    processTemplate(dependencies: LdkitObjectModelDependencyMap): Promise<LayerArtifact> {

        const ldkitArtifact = dependencies.ldkitSchemaArtifact;

        const objectModelTypeName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ModelType"
        });

        const ldkitSchemaInterface = this.generateAndSaveLdkitSchemaInterface(ldkitArtifact, dependencies.aggregate.technicalLabel);

        const modelTypeTemplate: LdkitObjectModelTypeTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                object_model_type: ldkitSchemaInterface,
                object_model_type_name: objectModelTypeName
            }
        };

        const render = this._templateRenderer.renderTemplate(modelTypeTemplate);

        const objectModelTypeArtifact: LayerArtifact = {
            exportedObjectName: objectModelTypeName,
            filePath: this._filePath,
            sourceText: render
        };

        return Promise.resolve(objectModelTypeArtifact);
    }
}
