import {RdfSourceWrap} from "../../core/adapter/rdf";
import {PimAssociation, PimAssociationEnd} from "../../pim/model";
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
): Promise<[PimAssociationEnd, PimAssociation, PimAssociationEnd]> {
  const mediates1 = new PimAssociationEnd();
  mediates1.iri = idProvider.cimToPim(entity.iri + "#má-vztažený-prvek-1");
  mediates1.pimPart = idProvider.cimToPim(await entity.node(RDFS.domain));

  const mediates2 = new PimAssociationEnd();
  mediates2.iri = idProvider.cimToPim(entity.iri + "#má-vztažený-prvek-2");
  mediates2.pimPart = idProvider.cimToPim(await entity.node(RDFS.range));

  const association = new PimAssociation();
  await loadSgovEntityToResource(entity, idProvider, association);

  association.pimEnd = [
    mediates1.iri,
    mediates2.iri,
  ];

  return [mediates1, association, mediates2];
}
