import {RdfSourceWrap} from "../../core/adapter/rdf";
import {PimAssociation} from "../../pim/model";
import {loadSgovEntityToResource} from "./sgov-entity-adapter";
import {POJEM, RDFS} from "../sgov-vocabulary";
import {IriProvider} from "../../cim";

export async function isSgovAssociation(
  entity: RdfSourceWrap,
): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVztahu);
}

export async function loadSgovAssociation(
  entity: RdfSourceWrap, idProvider: IriProvider,
): Promise<PimAssociation> {
  const result = new PimAssociation();
  await loadSgovEntityToResource(entity, idProvider, result);

  result.pimEnd = [
    await entity.node(RDFS.domain),
    await entity.node(RDFS.range),
  ].map(idProvider.cimToPim);

  return result;
}
