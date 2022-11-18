import {DataSpecificationArtefact, DataSpecificationDocumentation, DataSpecificationSchema} from "@dataspecer/core/data-specification/model";
import {PlantUmlGenerator} from "@dataspecer/plant-uml";
import {PlantUmlImageGenerator} from "./artifacts/plant-uml-image-generator";
import {BIKESHED} from "@dataspecer/bikeshed";
import {BikeshedHtmlGenerator} from "./artifacts/bikeshed-html-generator";
import {mergeConfigurations} from "@dataspecer/core/configuration/utils";
import { DefaultArtifactConfigurator } from "../default-artifact-configurator";

export class ArtifactConfigurator extends DefaultArtifactConfigurator {
  public async generateFor(
    dataSpecificationIri: string,
  ): Promise<DataSpecificationArtefact[]> {
    const artifacts = await super.generateFor(dataSpecificationIri);
    const currentSchemaArtefacts = artifacts
        .filter(artifact => DataSpecificationSchema.is(artifact))
        .map(artifact => artifact.iri as string);

    const dataSpecification = this.dataSpecifications.find(
        dataSpecification => dataSpecification.iri === dataSpecificationIri,
    );

    if (dataSpecification === undefined) {
      throw new Error(`Data specification with IRI ${dataSpecificationIri} not found.`);
    }

    const localConfiguration = dataSpecification.artefactConfiguration;
    const configuration = mergeConfigurations(this.configurators, this.configurationObject, localConfiguration);

    const dataSpecificationName = await this.getSpecificationDirectoryName(dataSpecificationIri);

    // PlantUML source
    const plantUml = new DataSpecificationDocumentation();
    plantUml.iri = `${dataSpecificationIri}#plantUml`;
    plantUml.outputPath = `${dataSpecificationName}/conceptual-model.plantuml`;
    plantUml.publicUrl = this.baseURL + plantUml.outputPath;
    plantUml.generator = PlantUmlGenerator.IDENTIFIER;
    plantUml.configuration = configuration;
    artifacts.push(plantUml);

    // PlantUml image
    const plantUmlImage = new DataSpecificationDocumentation();
    plantUmlImage.iri = `${dataSpecificationIri}#plantUmlImage`;
    plantUmlImage.outputPath = `${dataSpecificationName}/conceptual-model.png`;
    plantUmlImage.publicUrl = this.baseURL + plantUmlImage.outputPath;
    plantUmlImage.generator = PlantUmlImageGenerator.IDENTIFIER;
    plantUmlImage.configuration = configuration;
    artifacts.push(plantUmlImage);


    // Bikeshed source
    const bikeshed = new DataSpecificationDocumentation();
    bikeshed.iri = `${dataSpecificationIri}#bikeshed`;
    bikeshed.outputPath = `${dataSpecificationName}/documentation.bs`;
    bikeshed.publicUrl = this.baseURL + bikeshed.outputPath;
    bikeshed.generator = BIKESHED.Generator;
    bikeshed.artefacts = currentSchemaArtefacts;
    bikeshed.configuration = configuration;
    artifacts.push(bikeshed);

    // Bikeshed HTML
    const bikeshedHtml = new DataSpecificationDocumentation();
    bikeshedHtml.iri = `${dataSpecificationIri}#bikeshedHtml`;
    bikeshedHtml.outputPath = `${dataSpecificationName}/documentation.html`;
    bikeshedHtml.publicUrl = this.baseURL + bikeshedHtml.outputPath;
    bikeshedHtml.generator = BikeshedHtmlGenerator.IDENTIFIER;
    bikeshedHtml.artefacts = currentSchemaArtefacts;
    bikeshedHtml.configuration = configuration;
    artifacts.push(bikeshedHtml);

    return artifacts;
  }
}
