import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { normalizeName } from "./utils/utils";
import { Cache } from "./utils/cache";

export const AggregateMetadataCache: Cache<DataPsmSchema> = {
    content: {},
    resetCacheContent: function (): void {
        this.content = {};
    }
}

/**
 * Instances of this class contain metadata for an aggregate and provide
 * methods to retrieve and generate names and labels for a given data structure model.
 */
export class AggregateMetadata {
    private readonly _structureModel: DataPsmSchema;
    public readonly iri: string;
    public readonly specificationIri: string;
    /**
     * Either a data structure technical label. Otherwise,
     * white-space characters are replaced by '-' and entire
     * string is lower-cased. __Not suitable__ for direct object naming.
     */
    public readonly aggregateName: string;
    /**
     * Technical representation of the data structure.
     * Lower-case.
     */
    public readonly technicalLabel: string;
    public readonly roots: string[];

    /**
     * @param {string} specificationIri - The IRI identifier of the specification.
     * @param {DataPsmSchema} structure - The data structure model.
     */
    constructor(specificationIri: string, structure: DataPsmSchema) {

        this._structureModel = structure;
        this.specificationIri = specificationIri;

        this.iri = this._structureModel.iri!;
        this.aggregateName = this.getAggregateName(structure);
        this.technicalLabel = this.getTechnicalLabel(structure);
        this.roots = structure.dataPsmRoots;
    }

    /**
     * Retrieves the aggregate name for a given data structure model.
     *
     * @param structure - The `DataPsmSchema` data structure model for which the name is to be retrieved.
     * @returns The aggregate name as a string.
     * @throws Will throw an error if the data structure is missing a human-readable label.
     */
    private getAggregateName(structure: DataPsmSchema): string {

        if (structure.dataPsmTechnicalLabel) {
            return structure.dataPsmTechnicalLabel;
        }

        if (!structure.dataPsmHumanLabel ||
            Object.keys(structure.dataPsmHumanLabel).length === 0) {
            throw new Error(`Data structure ${structure.iri} is missing a name.`);
        }

        const labelKeys = Object.keys(structure.dataPsmHumanLabel);

        const humanLabel = labelKeys.includes("en")
            ? structure.dataPsmHumanLabel["en"]!
            : structure.dataPsmHumanLabel[labelKeys.at(0)!]!;

        const aggregateName = normalizeName(humanLabel);

        console.log(`Aggregate name: "${aggregateName}"`);
        return aggregateName;
    }

    /**
     * Generates a technical label for a given structure model. First, the `dataPsmTechnicalLabel`
     * is used to derive the name; if the property is not defined, the lowercase version of the `aggregateName`
     * is used. The method also handles multiple structure models with the same name - in this case, suffix "-1"
     * is appended to the technical label to ensure uniqueness.
     *
     * @param structure - The DataPsmSchema structure model for which the technical label is generated.
     * @returns The generated technical label.
     */
    private getTechnicalLabel(structure: DataPsmSchema): string {

        let techLabel = structure.dataPsmTechnicalLabel ?? this.aggregateName.toLowerCase();

        if (techLabel in AggregateMetadataCache.content &&
            structure.iri !== AggregateMetadataCache.content[techLabel]!.iri
        ) {
            // two different structure model with same technical label exist
            const techLabelSuffix = "-1";
            techLabel = `${techLabel}${techLabelSuffix}`;
        }

        AggregateMetadataCache.content[techLabel] = structure;

        return techLabel;
    }

    /**
     * Gets current aggregate name's pascal case version.
     * @returns The pascal case version of this aggregate name. Prepended by prefix (if exists) and suffix-appended (if exists).
     */
    public getAggregateNamePascalCase({ prefix, suffix }: { prefix?: string, suffix?: string } = {}): string {
        return `${prefix ?? ""}${this.toPascalCase(this.aggregateName)}${suffix ?? ""}`;
    }

    private toPascalCase(str: string): string {
        const pascalCased = str
            .replace(/-/g, " ")
            .replace(
                /(\w)(\w*)/g,
                (_, g1: string, g2: string) => g1.toUpperCase() + g2.toLowerCase()
            )
            .replace(/\s/g, "");

        return pascalCased;
    }
}