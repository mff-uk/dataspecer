import { OutputStream } from "@dataspecer/core/io/stream/output-stream";
import {ConceptualModel, ConceptualModelClass, ConceptualModelProperty} from "@dataspecer/core/conceptual-model";

const OFN_TYPE_PREFIX = "https://ofn.gov.cz/zdroj/základní-datové-typy/2020-07-01/";
export const KNOWN_DATA_TYPES = {
  [OFN_TYPE_PREFIX + "boolean"]: "boolean",
  [OFN_TYPE_PREFIX + "datum"]: "date",
  [OFN_TYPE_PREFIX + "čas"]: "time",
  [OFN_TYPE_PREFIX + "datum-a-čas"]: "dateTime",
  [OFN_TYPE_PREFIX + "celé-číslo"]: "integer",
  [OFN_TYPE_PREFIX + "desetinné-číslo"]: "decimal",
  [OFN_TYPE_PREFIX + "url"]: "url",
  [OFN_TYPE_PREFIX + "řetězec"]: "string",
  [OFN_TYPE_PREFIX + "text"]: "text",
};

const ZERO_WIDTH_SPACE = "\u200B";

export class PlantUml {
  private conceptualModel: ConceptualModel;
  public preferredLanguage = "cs";
  private registeredNameIdentifiers: Record<string, (ConceptualModelClass | ConceptualModelProperty)[]> = {};

  public constructor(conceptualModel: ConceptualModel) {
    this.conceptualModel = conceptualModel;
  }

  /**
   * Returns class identifier for PlantUML that is also a name
   * If escape is false, that means that the name is NOT an identifier
   */
  private getEntityPlantUMLIdentifier(cls: ConceptualModelClass | ConceptualModelProperty, escape: boolean = true): string {
    let name = cls.humanLabel?.[this.preferredLanguage];
    if (name === undefined) {
      const langs = Object.keys(cls.humanLabel);
      if (langs.length > 0) {
        name = cls.humanLabel[langs[0]];
      }
    }
    if (name === undefined) {
      name = cls.pimIri;
    }

    if (escape) {
      if (this.registeredNameIdentifiers[name] === undefined) {
        this.registeredNameIdentifiers[name] = [cls];
      }
      const entitiesWithSameName = this.registeredNameIdentifiers[name]!;
      if (!entitiesWithSameName.includes(cls)) {
        entitiesWithSameName.push(cls);
      }
      name += ZERO_WIDTH_SPACE.repeat(entitiesWithSameName.indexOf(cls));
    }

    // If name contains spaces or special characters, enclose in double quotes
    if (name.match(/^[a-zA-Z0-9_]+$/) || !escape) {
      return name;
    } else {
      return `"${name}"`;
    }
  }

  private getDataTypeInPlantUML(dataType: string): string {
    return KNOWN_DATA_TYPES[dataType] ?? dataType;
  }

  public async write(outputStream: OutputStream) {
    await outputStream.write("@startuml\n");
    await outputStream.write("set namespaceSeparator none\n");

    for (const cls of Object.values(this.conceptualModel.classes)) {
      const identifier = this.getEntityPlantUMLIdentifier(cls);
      await outputStream.write((identifier.startsWith("\"[A]") ? `abstract ` : ``) + `class ${identifier} {\n`);
      for (const prop of cls.properties) {
        if (prop.dataTypes.length === 0) {
          await outputStream.write(`  ${this.getEntityPlantUMLIdentifier(prop, false)}\n`);
        } else if (prop.dataTypes.length === 1) {
          const dataType = prop.dataTypes[0];
          if (dataType.isAttribute()) {
            await outputStream.write(
              `  ${this.getEntityPlantUMLIdentifier(prop)}: ${this.getDataTypeInPlantUML(dataType.dataType)}\n`
            );
          }
        } else {
          console.warn("More than one datatype for property", prop);
        }
      }
      await outputStream.write("}\n\n");
    }

    await this.writeAssociations(outputStream);

    await outputStream.write("@enduml\n");
  }

  private async writeAssociations(outputStream: OutputStream) {
    for (const cls of Object.values(this.conceptualModel.classes)) {
      for (const ext of cls.extends) {
        await outputStream.write(
          `${this.getEntityPlantUMLIdentifier(ext)} <|-- ${this.getEntityPlantUMLIdentifier(cls)}\n`
        );
      }
    }

    const associations: {
      id: string;

      label: string;
      ends: [string, string];
      cardinality: [
        { min: number | null; max: number | null },
        { min: number | null; max: number | null }
      ];
    }[] = [];

    // Collect forward associations
    for (const cls of Object.values(this.conceptualModel.classes)) {
      for (const prop of cls.properties) {
        if (prop.dataTypes.length !== 1) {
          continue;
        }
        if (prop.isReverse) {
          continue;
        }
        const dataType = prop.dataTypes[0];
        if (dataType.isAssociation()) {
          const target =
            this.conceptualModel.classes[dataType.pimClassIri as string];
          associations.push({
            id: prop.pimIri as string,
            label: this.getEntityPlantUMLIdentifier(prop),
            ends: [cls.pimIri as string, target.pimIri as string],
            cardinality: [
              { min: null, max: null },
              { min: prop.cardinalityMin, max: prop.cardinalityMax },
            ],
          });
        }
      }
    }

    // Collect reverse associations
    for (const cls of Object.values(this.conceptualModel.classes)) {
      for (const prop of cls.properties) {
        if (prop.dataTypes.length !== 1) {
          continue;
        }
        if (!prop.isReverse) {
          continue;
        }
        const dataType = prop.dataTypes[0];
        if (dataType.isAssociation()) {
          const existingAssociation = associations.find(a => a.id === prop.pimIri);
          if (existingAssociation) {
            existingAssociation.cardinality[0].min = prop.cardinalityMin;
            existingAssociation.cardinality[0].max = prop.cardinalityMax;
          }
        }
      }
    }

    // Write associations
    for (const association of associations) {
      const cardinality = association.cardinality.map((card) => this.getCardinalityForAssociation(card)).map(text => text ? ` "${text}"` : "");

      const source = this.getEntityPlantUMLIdentifier(
        this.conceptualModel.classes[association.ends[0]]
      );
      const target = this.getEntityPlantUMLIdentifier(
        this.conceptualModel.classes[association.ends[1]]
      );

      await outputStream.write(
        `${source}${cardinality[0]} --${cardinality[1]} ${target} :  ${association.label}\n`
      );
    }
  }

  private getCardinalityForAssociation(card: {min: number | null, max: number | null}) {
    if ((card.min ?? 0) !== 0  || card.max !== null) {
      return `${card.min ?? 0}..${card.max ?? "*"}`;
    } else {
      return null;
    }
  }
}
