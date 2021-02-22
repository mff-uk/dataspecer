import {ModelResource, ModelLoader} from "../platform-model-api";
import {PsmBase, loadPsmBaseIntoResource} from "./psm-base";
import {EntitySource} from "../../rdf/entity-source";
import * as PSM from "./psm-vocabulary";

export class PsmAssociation extends PsmBase {

  static readonly TYPE: string = "psm-association";

  psmParts: string[] = [];

  static is(resource: ModelResource): resource is PsmAssociation {
    return resource.types.includes(PsmAssociation.TYPE);
  }

  static as(resource: ModelResource): PsmAssociation {
    if (PsmAssociation.is(resource)) {
      return resource as PsmAssociation;
    }
    resource.types.push(PsmAssociation.TYPE);
    const result = resource as PsmAssociation;
    result.psmParts = result.psmParts || [];
    return result;
  }

}

export class PsmAssociationAdapter implements ModelLoader {

  canLoadResource(resource: ModelResource): boolean {
    return resource.rdfTypes.includes(PSM.ASSOCIATION);
  }

  async loadIntoResource(
    source: EntitySource, resource: ModelResource
  ): Promise<string[]> {
    const loadFromBase = await loadPsmBaseIntoResource(source, resource);
    const psmAssociation = PsmAssociation.as(resource);
    psmAssociation.psmParts = await source.irisExtended(PSM.HAS_PART);
    return [...loadFromBase, ...psmAssociation.psmParts];
  }

}
