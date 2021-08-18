import {RdfSourceWrap} from "../../core/adapter/rdf";
import {asPimAssociation, PimAssociation} from "../../platform-independent-model/model";
import {loadSgovEntity} from "./sgov-entity-adapter";
import {POJEM, RDFS} from "../sgov-vocabulary";
import {IdProvider} from "../../cim/id-provider";

export async function isSgovAssociation(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVztahu);
}

export async function loadSgovAssociation(entity: RdfSourceWrap, idProvider: IdProvider): Promise<PimAssociation> {
  const pimAssociation = asPimAssociation(await loadSgovEntity(entity, idProvider));

  pimAssociation.pimEnd = [await entity.node(RDFS.domain), await entity.node(RDFS.range)].map(idProvider.cimToPim);

  return pimAssociation;
}
