import {BikeshedAdapterArtefactContext, BikeshedAdapterContext} from "./bikeshed-adapter-context";
import {BikeshedConfiguration} from "../bikeshed-configuration";
import {BikeshedContent, BikeshedContentSection, BikeshedContentText} from "../bikeshed-model";
import {BIKESHED} from "../bikeshed-vocabulary";
import {ConceptualModel} from "@dataspecer/core/conceptual-model";
import {
    DataSpecification,
    DataSpecificationArtefact,
    DataSpecificationDocumentation,
    DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import {StructureModel} from "@dataspecer/core/structure-model/model/structure-model";

/**
 * For each structure we generate a section. And into the section we include
 * all relevant artefacts. The artefacts are included in given order, if
 * they represent a given structure model (PSM).
 */
export async function createBikeshedStructureSection(
    context: BikeshedAdapterContext & BikeshedConfiguration,
    artefact: DataSpecificationDocumentation,
    specification: DataSpecification,
    conceptualModel: ConceptualModel,
    structureModel: StructureModel
): Promise<BikeshedContent> {
    const label = context.selectString(structureModel.humanLabel);
    const result = new BikeshedContentSection(label, null);
    const description = context.selectString(structureModel.humanDescription);
    if (description !== null) {
        result.content.push(new BikeshedContentText(description));
    }

    for (const artefactToInclude of specification.artefacts) {
        if (!artefact.artefacts.includes(artefactToInclude.iri)) {
            continue;
        }

        if (!shouldBeIncluded(structureModel, artefactToInclude)) {
            continue;
        }

        const generator = await context.generatorContext.createGenerator(
            artefactToInclude.generator
        );
        if (generator === null) {
            continue;
        }

        const contextForGenerator: BikeshedAdapterArtefactContext = {
            ...context,
            ownerArtefact: artefact,
            specification: specification,
            artefact: artefactToInclude,
            conceptualModel: conceptualModel,
            structureModel: structureModel,
        };

        const contentToInclude = await generator.generateForDocumentation(
            context.generatorContext,
            artefact,
            specification,
            BIKESHED.Generator,
            contextForGenerator
        );

        if (contentToInclude === null) {
            continue;
        }

        result.content.push(contentToInclude as BikeshedContent);
    }

    return result;
}

export function shouldBeIncluded(
    structureModel: StructureModel,
    artefact: DataSpecificationArtefact
): boolean {
    if (DataSpecificationSchema.is(artefact)) {
        if (artefact.psm === structureModel.psmIri) {
            return true;
        }
    }
    return false;
}
