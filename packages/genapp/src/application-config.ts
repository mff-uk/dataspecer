import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { toPascalCase } from "./utils/utils";

export type Iri = string;

export class AggregateMetadata {
    private readonly _dataStructure: DataPsmSchema;
    public readonly iri: string;
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

    constructor(structure: DataPsmSchema) {
        this._dataStructure = structure;

        this.iri = this._dataStructure.iri!;
        this.aggregateName = this.getAggregateName(structure);
        this.technicalLabel = structure.dataPsmTechnicalLabel ?? this.aggregateName.toLowerCase();
        this.roots = structure.dataPsmRoots;
    }

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

        const aggregateName = humanLabel
            .toLowerCase()
            .replace(/\s+/g, "-");

        console.log(`Aggregate name: "${aggregateName}"`);
        return aggregateName;
    }

    /**
     * Gets current aggregate name's pascal case version. Suitable for object naming.
     * @param
     * @returns The pascal case version of this aggregate name. Prepended by prefix (if exists) and suffix-appended (if exists).
     */
    public getAggregateNamePascalCase({ prefix, suffix }: { prefix?: string, suffix?: string } = {}): string {
        return `${prefix ?? ""}${toPascalCase(this.aggregateName)}${suffix ?? ""}`;
    }
}