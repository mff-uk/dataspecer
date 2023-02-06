import {BikeshedAdapterContext} from "./bikeshed-adapter-context";
import {BikeshedConfiguration} from "../bikeshed-configuration";
import {BikeshedMetadataKeys} from "../bikeshed-model";
import {ConceptualModel} from "@dataspecer/core/conceptual-model/model/conceptual-model";

export function createBikeshedMetadata(
    context: BikeshedAdapterContext & BikeshedConfiguration,
    conceptualModel: ConceptualModel
): Record<string, string> {
    const label: string = context.selectString(conceptualModel.humanLabel);
    return {
        [BikeshedMetadataKeys.title]: label,
        [BikeshedMetadataKeys.shortname]: label,
        [BikeshedMetadataKeys.status]: "LS",
        [BikeshedMetadataKeys.editor]: context.editor,
        [BikeshedMetadataKeys.boilerplate]: "conformance no, copyright no",
        [BikeshedMetadataKeys.abstract]: context.abstract,
        [BikeshedMetadataKeys.markup]: "markdown yes",
        ...context.otherMetadata,
    };
}
