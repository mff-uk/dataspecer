import { OutputStream } from "@dataspecer/core/io/stream/output-stream";
import { ConceptualModel, ConceptualModelClass } from "@dataspecer/core/conceptual-model";

export class PlantUml {
  private conceptualModel: ConceptualModel;

  public constructor(conceptualModel: ConceptualModel) {
    this.conceptualModel = conceptualModel;
  }

  private getClassName(cls: ConceptualModelClass): string {
    const name = cls.humanLabel?.["cs"] ?? "";
    if (name.includes(" ")) {
      return `"${name}"`;
    } else {
      return name;
    }
  }

  public async write(outputStream: OutputStream) {
    await outputStream.write("@startuml\n");

    for (const cls of Object.values(this.conceptualModel.classes)) {
      await outputStream.write(`class ${this.getClassName(cls)} {\n`);
      for (const prop of cls.properties) {
        if (prop.dataTypes.length === 0) {
          await outputStream.write(`  ${prop.humanLabel?.["cs"]}\n`);
        } else if (prop.dataTypes.length === 1) {
          const dataType = prop.dataTypes[0];
          if (dataType.isAttribute()) {
            await outputStream.write(
              `  ${prop.humanLabel?.["cs"]}: ${dataType.dataType}\n`
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
          `${this.getClassName(ext)} <|-- ${this.getClassName(cls)}\n`
        );
      }
    }

    const associations: {
      label: string;
      ends: [string, string];
      cardinality: [
        { min: number | null; max: number | null },
        { min: number | null; max: number | null }
      ];
    }[] = [];

    // Collect associations
    for (const cls of Object.values(this.conceptualModel.classes)) {
      for (const prop of cls.properties) {
        if (prop.dataTypes.length !== 1) {
          continue;
        }
        const dataType = prop.dataTypes[0];
        if (dataType.isAssociation()) {
          const target =
            this.conceptualModel.classes[dataType.pimClassIri as string];
          const existingAssociation = associations.find(
            (association) =>
              association.ends[0] === target.pimIri &&
              association.ends[1] === cls.pimIri
          );
          if (existingAssociation) {
            existingAssociation.cardinality[0].min = prop.cardinalityMin;
            existingAssociation.cardinality[0].max = prop.cardinalityMax;
          } else {
            associations.push({
              label: prop.humanLabel?.["cs"] ?? "",
              ends: [cls.pimIri as string, target.pimIri as string],
              cardinality: [
                { min: null, max: null },
                { min: prop.cardinalityMin, max: prop.cardinalityMax },
              ],
            });
          }
        }
      }
    }

    // Write associations
    for (const association of associations) {
      const cardinality = association.cardinality.map((card) => {
        if (card.min === null && card.max === null) {
          return "*";
        } else if (card.min === null) {
          return `0..${card.max}`;
        } else if (card.max === null) {
          return `${card.min}..*`;
        } else {
          return `${card.min}..${card.max}`;
        }
      });

      const source = this.getClassName(
        this.conceptualModel.classes[association.ends[0]]
      );
      const target = this.getClassName(
        this.conceptualModel.classes[association.ends[1]]
      );

      await outputStream.write(
        `${source} "${cardinality[0]}" -- "${cardinality[1]}" ${target} :  ${association.label}\n`
      );
    }
  }
}
