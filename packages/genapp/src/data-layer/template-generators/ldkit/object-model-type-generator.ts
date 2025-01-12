import { DataLayerTemplateDescription } from "../../../engine/templates/template-interfaces";
import { LayerArtifact } from "../../../engine/layer-artifact";
import { TemplateConsumer, TemplateDependencyMap } from "../../../engine/templates/template-consumer";
import { ArtifactCache } from "../../../utils/artifact-saver";
import { ObjectModelTypeGeneratorHelper } from "./object-model-generator-helper";

/**
 * Interface representing the template model for rendering object model interface from the aggregate LDkit schema.
 *
 * @interface LdkitObjectModelTypeTemplate
 */
interface LdkitObjectModelTypeTemplate extends DataLayerTemplateDescription {
    placeholders: {
        object_model_type: string;
        object_model_type_name: string;
    }
}

interface LdkitObjectModelDependencyMap extends TemplateDependencyMap {
    ldkitSchemaArtifact: LayerArtifact
}

/**
 * The `LdkitObjectModelTypeGenerator` class is responsible for rendering a TypeScript object types
 * based on LDkit schema.
 *
 * @extends TemplateConsumer<LdkitObjectModelTypeTemplate>
 */
export class LdkitObjectModelTypeGenerator extends TemplateConsumer<LdkitObjectModelTypeTemplate> {

    private readonly _generatorHelper: ObjectModelTypeGeneratorHelper;

    constructor(outputFilePath: string) {
        super({
            filePath: outputFilePath,
            templatePath: `./list/data-layer/ldkit/object-model-type`
        });

        this._generatorHelper = new ObjectModelTypeGeneratorHelper();
    }

    /** @ignore */
    private getSecondOccurenceIndex(str: string, subString: string): number {

        const firstOccurrence = str.indexOf(subString);

        if (firstOccurrence === -1) {
            return -1;
        }

        return str.indexOf(subString, firstOccurrence + 1);
    }

    /**
     * Extracts the LDkit schema object from its source string.
     *
     * @param ldkitSchemaSource - The source string of the LDKit schema.
     * @returns The serialized LDkit schema object.
     */
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

    /** @ignore */
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

    /**
     * The function processes each property of the input object and converts it to a TypeScript type using a set of predefined rules:
     * - Properties starting with "@" are ignored,
     * - Properties with types ending in "undefined" are converted to an optional type,
     * - Array types and nested objects are processed recursively,
     * - "Record" types are converted to a <key, value> types
     *
     * @param obj - The serialized object to convert.
     * @returns The TypeScript type definition as a string.
     *
     * Example input:
     * ```json
     * {
     *   "name": "string",
     *   "age": "number | undefined",
     *   "tags": "string[]",
     *   "address": "{ \"street\": \"string\", \"city\": \"string\" }",
     *   "additionalInfo": "Record<string, any>"
     * }
     * ```
     *
     * Example output:
     * ```typescript
     * {
     *   "name": string,
     *   "age"?: number,
     *   "tags": string[],
     *   "address": {
     *     "street": string,
     *     "city": string
     *   },
     *   "additionalInfo": { [key: string]: any },
     * }
     * ```
     */
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

    /**
     * Processes the template to render an aggregate type based on its LDkit schema.
     *
     * @param dependencies - An object containing the dependencies required for generating the object model type.
     * @returns A promise that resolves to a LayerArtifact containing the generated object type definition.
     */
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
