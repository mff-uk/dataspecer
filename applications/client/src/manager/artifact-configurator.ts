import { mergeConfigurations } from "@dataspecer/core/configuration/utils";
import { DataSpecificationConfigurator } from "@dataspecer/core/data-specification/configuration";
import { DataSpecificationArtefact, DataSpecificationDocumentation } from "@dataspecer/core/data-specification/model";
import { PlantUmlGenerator } from "@dataspecer/plant-uml";
import { DefaultArtifactConfigurator } from "../default-artifact-configurator";
import { PlantUmlImageGenerator } from "./artifacts/plant-uml-image-generator";

export class ArtifactConfigurator extends DefaultArtifactConfigurator {
  public async generateFor(
    dataSpecificationIri: string,
  ): Promise<DataSpecificationArtefact[]> {
    const artifacts = await super.generateFor(dataSpecificationIri);

    const dataSpecification = this.dataSpecifications.find(
        dataSpecification => dataSpecification.iri === dataSpecificationIri,
    );

    if (dataSpecification === undefined) {
      throw new Error(`Data specification with IRI ${dataSpecificationIri} not found.`);
    }

    const localConfiguration = dataSpecification.artefactConfiguration;
    const configuration = mergeConfigurations(this.configurators, this.configurationObject, localConfiguration);

    const dataSpecificationName = await this.getSpecificationDirectoryName(dataSpecificationIri);

    const dataSpecificationConfiguration = DataSpecificationConfigurator.getFromObject(configuration);
    const generatorsEnabledByDefault = dataSpecificationConfiguration.generatorsEnabledByDefault!;

    // PlantUML source
    const plantUml = new DataSpecificationDocumentation();
    plantUml.iri = `${dataSpecificationIri}#plantUml`;
    plantUml.outputPath = `${dataSpecificationName}/conceptual-model.plantuml`;
    plantUml.publicUrl = `${this.baseURL}/conceptual-model.plantuml`;
    plantUml.generator = PlantUmlGenerator.IDENTIFIER;
    plantUml.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["plantUML"] ?? generatorsEnabledByDefault) !== false) {
      artifacts.push(plantUml);
    }

    // PlantUml image
    const plantUmlImage = new DataSpecificationDocumentation();
    plantUmlImage.iri = `${dataSpecificationIri}#plantUmlImage`;
    plantUmlImage.outputPath = `${dataSpecificationName}/conceptual-model.svg`;
    plantUmlImage.publicUrl = `${this.baseURL}/conceptual-model.svg`;
    plantUmlImage.generator = PlantUmlImageGenerator.IDENTIFIER;
    plantUmlImage.configuration = configuration;
    if ((dataSpecificationConfiguration.useGenerators?.["plantUML"] ?? generatorsEnabledByDefault) !== false) {
      artifacts.push(plantUmlImage);
    }

    // New bikeshed by mustache-template - default off
    if ((dataSpecificationConfiguration.useGenerators?.["respec"] ?? generatorsEnabledByDefault) !== false) {
      // Respec
      const respec = new DataSpecificationDocumentation();
      respec.iri = `${dataSpecificationIri}#respec`;
      respec.outputPath = `${dataSpecificationName}/documentation.html`;
      respec.publicUrl = `${this.baseURL}/documentation.html`;
      respec.generator = "https://schemas.dataspecer.com/generator/template-artifact";
      respec.artefacts = artifacts.map(a => a.iri);
      // @ts-ignore
      respec.templateType = "respec";
      respec.configuration = configuration;
      artifacts.push(respec);
    }

    if ((dataSpecificationConfiguration.useGenerators?.["LDkit"] ?? generatorsEnabledByDefault) === true) {
      const artifact: DataSpecificationArtefact = new DataSpecificationArtefact();
      artifact.iri = `${dataSpecificationIri}#LDkit`;
      artifact.outputPath = `${dataSpecificationName}/LDkit/`;
      artifact.publicUrl = `${this.baseURL}/LDkit/`;
      artifact.generator = "https://schemas.dataspecer.com/generator/LDkit";
      //artifact.configuration = configuration;
      artifacts.push(artifact);
    }


    return artifacts;
  }
}
