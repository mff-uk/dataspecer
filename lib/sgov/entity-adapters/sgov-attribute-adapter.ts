import {RdfSourceWrap} from "../../core/adapter/rdf";
import {asPimAttribute, PimAttribute} from "../../pim/model";
import {loadSgovEntity} from "./sgov-entity-adapter";
import {POJEM, RDFS} from "../sgov-vocabulary";
import {IriProvider} from "../../cim/iri-provider";

export async function isSgovAttribute(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVlastnosti);
}

export async function loadSgovAttribute(entity: RdfSourceWrap, idProvider: IriProvider): Promise<PimAttribute> {
  const pimAttribute = asPimAttribute(await loadSgovEntity(entity, idProvider));

  pimAttribute.pimOwnerClass = idProvider.cimToPim(await entity.node(RDFS.domain));

  return pimAttribute;
}
