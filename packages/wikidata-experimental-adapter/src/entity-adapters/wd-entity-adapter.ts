import { PimResource } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";
import { EntityIdsList, EntityTypes, IWdEntity } from "../connector/entities/wd-entity";
import { WIKIDATA_ENTITY_PREFIX } from "../vocabulary";

export function entityIdToPimId(entityId: number, type: EntityTypes): string {
    if (type === EntityTypes.CLASS) {
        return WIKIDATA_ENTITY_PREFIX + "Q" + entityId.toString();
    } else {
        return WIKIDATA_ENTITY_PREFIX + "P" + entityId.toString();
    }
}

export function entityIdsToPimIds(entityIds: EntityIdsList, type: EntityTypes): string[] {
    return entityIds.map((id) => entityIdToPimId(id, type));
}

export function loadWikidataEntityToResource(
  entity: IWdEntity,
  type: EntityTypes,
  idProvider: IriProvider,
  resource: PimResource,
): void {
  resource.pimHumanLabel = entity.labels;
  resource.pimHumanDescription = entity.descriptions;
  resource.pimInterpretation = entityIdToPimId(entity.id, type);
  resource.iri = idProvider.cimToPim(resource.pimInterpretation);
}
