import { PimResource } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";
import { WdEntityDescOnly } from "../wikidata-entities/wd-entity.ts";

export function loadWikidataEntityToResource(
    entity: WdEntityDescOnly,
    iriProvider: IriProvider,
    resource: PimResource,
): void {
    resource.pimHumanLabel = entity.labels;
    resource.pimHumanDescription = entity.descriptions;
    resource.pimInterpretation = entity.iri;
    resource.iri = iriProvider.cimToPim(resource.pimInterpretation);
}
