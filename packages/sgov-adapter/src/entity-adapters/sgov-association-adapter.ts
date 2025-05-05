import { RdfSource, RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimAssociation, PimAssociationEnd } from "@dataspecer/core/pim/model";
import { loadSgovEntityToResource } from "./sgov-entity-adapter.ts";
import { POJEM, RDFS } from "../sgov-vocabulary.ts";
import { IriProvider } from "@dataspecer/core/cim";
import { loadSgovCardinalities } from "./sgov-resource-cardinality-adapter.ts";

export async function isSgovAssociation(
  entity: RdfSourceWrap
): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVztahu);
}

export async function loadSgovAssociation(
  entity: RdfSourceWrap,
  source: RdfSource,
  idProvider: IriProvider
): Promise<[PimAssociationEnd, PimAssociation, PimAssociationEnd]> {
  const mediates1 = new PimAssociationEnd();
  mediates1.iri = idProvider.cimToPim(entity.iri + "#má-vztažený-prvek-1");
  mediates1.pimPart = idProvider.cimToPim(await entity.node(RDFS.domain));
  const domainCardinality = await entity.node("__domain_cardinality");
  if (domainCardinality) {
    await loadSgovCardinalities(
      RdfSourceWrap.forIri(domainCardinality, source),
      mediates1
    );
  }

  const mediates2 = new PimAssociationEnd();
  mediates2.iri = idProvider.cimToPim(entity.iri + "#má-vztažený-prvek-2");
  mediates2.pimPart = idProvider.cimToPim(await entity.node(RDFS.range));
  const rangeCardinality = await entity.node("__range_cardinality");
  if (rangeCardinality) {
    await loadSgovCardinalities(
      RdfSourceWrap.forIri(rangeCardinality, source),
      mediates2
    );
  }

  const association = new PimAssociation();
  await loadSgovEntityToResource(entity, idProvider, association);
  // Every association in Sgov vocabulary is oriented
  association.pimIsOriented = true;

  association.pimEnd = [mediates1.iri, mediates2.iri];

  return [mediates1, association, mediates2];
}
