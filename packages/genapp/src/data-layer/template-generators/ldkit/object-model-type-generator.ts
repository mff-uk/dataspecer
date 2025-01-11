import { ImportRelativePath, DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/templates/template-consumer";
import { ArtifactCache } from "../../../utils/artifact-saver";
import { ObjectModelTypeGeneratorHelper } from "./object-model-generator-helper";

interface LdkitObjectModelTypeTemplate extends DataLayerTemplateDescription {
    placeholders: {
        object_model_type: string;
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

    private getSecondOccurenceIndex(str: string, subString: string): number {

        const firstOccurrence = str.indexOf(subString);

        if (firstOccurrence === -1) {
            return -1;
        }

        return str.indexOf(subString, firstOccurrence + 1);
    }

    private getSerializedLdkitSchema(ldkitSchemaSource: string): string {
        const objectStartIndex = this.getSecondOccurenceIndex(ldkitSchemaSource, "{");
        const objectEndIndex = ldkitSchemaSource.indexOf(" as const;");

        const result = ldkitSchemaSource.substring(objectStartIndex, objectEndIndex)
            .replace(/"@type": \s*(\w+)\.(\w+)/g, '"@type": "$1.$2"');
        console.log(result);
        return result;
    }

    private generateAndSaveLdkitSchemaInterface(ldkitArtifact: LayerArtifact, aggregateTechnicalLabel: string) {
        const ldkitSchemaInstance = JSON.parse(this.getSerializedLdkitSchema(ldkitArtifact.sourceText));

        const ldkitSchemaInterface = this._generatorHelper.getInterfaceFromLdkitSchemaInstance(ldkitSchemaInstance);

        ArtifactCache.content[`__${aggregateTechnicalLabel}DataModelInterface`] = JSON.stringify(ldkitSchemaInterface);

        return ldkitSchemaInterface;
    }

    private splitRecordToKeyAndValueTypes(recordTypeName: any): [string, string] {

        const recordTypeBeginMarker = "<";
        const recordTypeEndMarker = ">";
        const recordKeyValueTypeSeparator = ", ";

        const keyTypeName = recordTypeName.substring(
            recordTypeName.indexOf(recordTypeBeginMarker) + recordTypeBeginMarker.length,
            recordTypeName.lastIndexOf(recordKeyValueTypeSeparator)
        );

        const valueTypeName = recordTypeName.substring(
            recordTypeName.indexOf(recordKeyValueTypeSeparator) + recordKeyValueTypeSeparator.length,
            recordTypeName.lastIndexOf(recordTypeEndMarker)
        );

        return [keyTypeName, valueTypeName];
    }

    private convertSerializedTypeToTypescriptType(obj: any): string {
        const result = Object.entries(obj)
            .map(([propName, typeName]: [string, any]): string | null => {

            if (propName.startsWith("@")) {
                return null;
            }

            let optionalFlag: string = "";
            if (typeName.endsWith(" | undefined")) {
                optionalFlag = "?";
                typeName = typeName.substring(0, typeName.lastIndexOf(" | undefined"));
            }

            if (typeName.endsWith("[]")) {
                const nestedStr = typeName.substring(0, typeName.length - "[]".length);
                try {
                    const nested = JSON.parse(nestedStr);
                    return `"${propName}"${optionalFlag}: ${this.convertSerializedTypeToTypescriptType(nested)}[],`
                } catch(error) {
                    return `"${propName}"${optionalFlag}: ${nestedStr}[],`
                }
            }

            if (typeName.startsWith("{")) {
                const nested = JSON.parse(typeName);
                return `"${propName}"${optionalFlag}: ${this.convertSerializedTypeToTypescriptType(nested)}`
            }

            if (typeName.startsWith("Record")) {
                const [keyTypeName, valueTypeName] = this.splitRecordToKeyAndValueTypes(typeName);
                return `"${propName}"${optionalFlag}: { [key: ${keyTypeName}]: ${valueTypeName} },`
            }

            return `"${propName}"${optionalFlag}: ${typeName},`
            })
            .filter((item: string | null): item is string => item !== null)
            .join("\n");

        return `{
            ${result}
        }`;
    }

    processTemplate(dependencies: LdkitObjectModelDependencyMap): Promise<LayerArtifact> {

        const ldkitArtifact = dependencies.ldkitSchemaArtifact;

        const objectModelTypeName = dependencies.aggregate.getAggregateNamePascalCase({
            suffix: "ModelType"
        });

        const ldkitSchemaInterface = this.generateAndSaveLdkitSchemaInterface(ldkitArtifact, dependencies.aggregate.technicalLabel);

        const convertedType = this.convertSerializedTypeToTypescriptType(ldkitSchemaInterface);

        const modelTypeTemplate: LdkitObjectModelTypeTemplate = {
            templatePath: this._templatePath,
            placeholders: {
                object_model_type: convertedType,
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
