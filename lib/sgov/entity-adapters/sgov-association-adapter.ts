import {RdfSourceWrap} from "../../core/adapter/rdf";
import {asPimAssociation, PimAssociation} from "../../pim/model";
import {loadSgovEntity} from "./sgov-entity-adapter";
import {POJEM, RDFS} from "../sgov-vocabulary";
import {IriProvider} from "../../cim/iri-provider";

export async function isSgovAssociation(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVztahu);
}

export async function loadSgovAssociation(entity: RdfSourceWrap, idProvider: IriProvider): Promise<PimAssociation> {
  const pimAssociation = asPimAssociation(await loadSgovEntity(entity, idProvider));

  pimAssociation.pimEnd = [await entity.node(RDFS.domain), await entity.node(RDFS.range)].map(idProvider.cimToPim);

  return pimAssociation;
}
