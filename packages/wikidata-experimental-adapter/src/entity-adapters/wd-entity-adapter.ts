import { PimResource } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";
import { EntityId, EntityIdsList, EntityTypes, IWdEntity } from "../connector/entities/wd-entity";
import { WIKIDATA_ENTITY_PREFIX } from "../vocabulary";

export function entityIdToCimId(entityId: number, type: EntityTypes): string {
    if (type === EntityTypes.CLASS) {
        return WIKIDATA_ENTITY_PREFIX + "Q" + entityId.toString();
    } else {
        return WIKIDATA_ENTITY_PREFIX + "P" + entityId.toString();
    }
}

export function entityIdsToCimIds(entityIds: EntityIdsList, type: EntityTypes): string[] {
    return entityIds.map((id) => entityIdToCimId(id, type));
}

export function cimIriToEntityId(cimIri: string): EntityId {
  return Number(cimIri.split("/").pop().slice(1));
}

export function loadWikidataEntityToResource(
  entity: IWdEntity,
  type: EntityTypes,
  iriProvider: IriProvider,
  resource: PimResource,
): void {
  resource.pimHumanLabel = entity.labels;
  resource.pimHumanDescription = entity.descriptions;
  resource.pimInterpretation = entityIdToCimId(entity.id, type);
  resource.iri = iriProvider.cimToPim(resource.pimInterpretation);
}
