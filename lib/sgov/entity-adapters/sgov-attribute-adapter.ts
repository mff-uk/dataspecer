import {RdfSourceWrap} from "../../core/adapter/rdf";
import {asPimAttribute, PimAttribute} from "../../platform-independent-model/model";
import {loadSgovEntity} from "./sgov-entity-adapter";
import {POJEM, RDFS} from "../sgov-vocabulary";
import {IdProvider} from "../../cim/id-provider";

export async function isSgovAttribute(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVlastnosti);
}

export async function loadSgovAttribute(entity: RdfSourceWrap, idProvider: IdProvider): Promise<PimAttribute> {
  const pimAttribute = asPimAttribute(await loadSgovEntity(entity, idProvider));

  pimAttribute.pimOwnerClass = idProvider.cimToPim(await entity.node(RDFS.domain));

  return pimAttribute;
}
