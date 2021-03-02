import {ModelResource, ModelLoader} from "../platform-model-api";
import {PimBase, loadPimBaseIntoResource} from "./pim-base";
import * as PIM from "./pim-vocabulary";
import {EntitySource} from "../../rdf/entity-source";

export class PimAssociation extends PimBase {

  static readonly TYPE: string = "pim-association";

  pimEnd: PimAssociationEnd[] = [];

  static is(resource: ModelResource): resource is PimAssociation {
    return resource.types.includes(PimAssociation.TYPE);
  }

  static as(resource: ModelResource): PimAssociation {
    if (PimAssociation.is(resource)) {
      return resource as PimAssociation;
    }
    resource.types.push(PimAssociation.TYPE);
    const result = resource as PimAssociation;
    result.pimEnd = result.pimEnd || [];
    return result;
  }

}

export class PimAssociationEnd {

  pimParticipant?: string;

}

export class PimAssociationAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PIM.ASSOCIATION);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource
  ): Promise<string[]> {
    const loadFromBase = await loadPimBaseIntoResource(source, resource);
    const pimAssociation = PimAssociation.as(resource);
    const loadEnds = [];
    for (const {entity} of await source.entitiesExtended(PIM.HAS_END)) {
      const pimEnd = await this.loadPimReference(source.changeEntity(entity));
      pimAssociation.pimEnd.push(pimEnd);
      loadEnds.push(pimEnd.pimParticipant);
    }
    return [...loadFromBase, pimAssociation.pimHasClass, ...loadEnds];
  }

  async loadPimReference(source: EntitySource): Promise<PimAssociationEnd> {
    const result = new PimAssociationEnd();
    const entity = (await source.entity(PIM.HAS_PARTICIPANT));
    if (entity !== undefined) {
      result.pimParticipant = entity.id;
    }
    return result;
  }

}
