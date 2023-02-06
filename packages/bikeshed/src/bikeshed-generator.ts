import {DataSpecification, DataSpecificationArtefact, DataSpecificationDocumentation,} from "@dataspecer/core/data-specification/model";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {writeBikeshed} from "./bikeshed-writer";
import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {Bikeshed} from "./bikeshed-model";
import {assertFailed, LanguageString} from "@dataspecer/core/core";
import {specificationToBikeshed} from "./adapter/bikeshed-adapter";
import {ConceptualModelClass, ConceptualModelProperty,} from "@dataspecer/core/conceptual-model";
import {StructureModel, StructureModelClass, StructureModelProperty,} from "@dataspecer/core/structure-model/model";
import {BIKESHED} from "./bikeshed-vocabulary";
import {BikeshedConfiguration, BikeshedConfigurator, DefaultBikeshedConfiguration} from "./bikeshed-configuration";
import translations from "./i18n";
import i18next from "i18next";

export class BikeshedGenerator implements ArtefactGenerator {
  identifier(): string {
    return BIKESHED.Generator;
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ) {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await writeBikeshed(model, stream);
    await stream.close();
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<Bikeshed> {
    if (DataSpecificationDocumentation.is(artefact)) {
      const configuration = BikeshedConfigurator.merge(
          DefaultBikeshedConfiguration,
          BikeshedConfigurator.getFromObject(artefact.configuration)
      ) as BikeshedConfiguration;

      const i18n = i18next.createInstance();
      await i18n.init({
        resources: translations,
        fallbackLng: 'en',
        defaultNS: "",
        lng: configuration.language,
        supportedLngs: Object.keys(translations),
        interpolation: {
          escapeValue: false,
        },
      });

      // @ts-ignore
      window.i18n = i18n;

      const selectString = (value: LanguageString | null) => {
        // We define default here, so it is consistent across documentation.
        return selectOptionalString(value) ?? "nedefinováno";
      }

      const selectOptionalString = (value: LanguageString | null) => {
        if (!value) {
          return null;
        }
        const someValue = Object.values(value)[0] ?? null;
        return value[configuration.language] ?? value["en"] ?? someValue;
      }

      function sanitizeLink(value): string {
        return value.replace(/ /g, "-").toLowerCase();
      }

      function conceptualClassAnchor(model: ConceptualModelClass): string {
        const label = selectString(model.humanLabel);
        return sanitizeLink("konceptuální-třída-" + label);
      }

      function conceptualPropertyAnchor(
          owner: ConceptualModelClass,
          property: ConceptualModelProperty
      ): string {
        const href = conceptualClassAnchor(owner);
        const label = selectString(property.humanLabel);
        return href + sanitizeLink("-" + label);
      }

      function createStructuralClassAnchor(context: ArtefactGeneratorContext) {
        return function structuralClassAnchor(
            format: string,
            structureModel: StructureModel,
            structureClass: StructureModelClass
        ): string {
          const modelLabel = selectString(structureModel.humanLabel);
          const classLabel = selectString(
              structureClass.humanLabel ??
              getConceptualClass(context, structureModel, structureClass)?.humanLabel
          );
          return sanitizeLink(
              `strukturální-${format}-${modelLabel}-třída-${classLabel}`
          );
        };
      }

      function getConceptualClass(
          context: ArtefactGeneratorContext,
          structureModel: StructureModel,
          structureClass: StructureModelClass
      ): ConceptualModelClass | null {
        for (const conceptualModel of Object.values(context.conceptualModels)) {
          const conceptualClass = conceptualModel.classes[structureClass.pimIri];
          if (conceptualClass !== undefined) {
            return conceptualClass;
          }
        }
        return null;
      }

      function createStructuralPropertyAnchor(context: ArtefactGeneratorContext) {
        const structuralClassAnchor = createStructuralClassAnchor(context);
        return function createStructuralPropertyAnchor(
            format: string,
            structureModel: StructureModel,
            structureClass: StructureModelClass,
            structureProperty: StructureModelProperty
        ): string {
          const href = structuralClassAnchor(format, structureModel, structureClass);
          // TODO we probably should also use humanLabel from PIM here as well.
          const label = selectString(structureProperty.humanLabel);
          return href + sanitizeLink("-" + label);
        };
      }

      return await specificationToBikeshed(
        {
          generatorContext: context,
          selectString: selectString,
          selectOptionalString: selectOptionalString,
          sanitizeLink: sanitizeLink,
          conceptualClassAnchor: conceptualClassAnchor,
          conceptualPropertyAnchor: conceptualPropertyAnchor,
          structuralClassAnchor: createStructuralClassAnchor(context),
          structuralPropertyAnchor: createStructuralPropertyAnchor(context),
          i18n,
          ...configuration
        },
        artefact,
        specification
      );
    } else {
      assertFailed(`'${artefact.iri}' is not of type documentation.`);
    }
  }

  async generateForDocumentation(): Promise<unknown | null> {
    // As of now documentation can not be included.
    return null;
  }
}
