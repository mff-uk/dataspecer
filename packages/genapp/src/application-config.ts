import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { normalizeName } from "./utils/utils";

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

    constructor(specificationIri: string, structure: DataPsmSchema) {
        this._structureModel = structure;
        this.specificationIri = specificationIri;

        this.iri = this._structureModel.iri!;
        this.aggregateName = this.getAggregateName(structure);
        this.technicalLabel = this.getTechnicalLabel(structure);
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

        const aggregateName = normalizeName(humanLabel);

        console.log(`Aggregate name: "${aggregateName}"`);
        return aggregateName;
    }

    private getTechnicalLabel(structure: DataPsmSchema): string {
        return structure.dataPsmTechnicalLabel ?? this.aggregateName.toLowerCase();
    }

    /**
     * Gets current aggregate name's pascal case version. Suitable for object naming.
     * @param
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