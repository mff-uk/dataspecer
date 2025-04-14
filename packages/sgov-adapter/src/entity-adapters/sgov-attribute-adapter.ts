import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimAttribute } from "@dataspecer/core/pim/model";
import { loadSgovEntityToResource } from "./sgov-entity-adapter.ts";
import { POJEM, RDFS } from "../sgov-vocabulary.ts";
import { IriProvider } from "@dataspecer/core/cim";
import { loadSgovCardinalities } from "./sgov-resource-cardinality-adapter.ts";

export async function isSgovAttribute(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVlastnosti);
}

export async function loadSgovAttribute(
  entity: RdfSourceWrap,
  idProvider: IriProvider
): Promise<PimAttribute> {
  const result = new PimAttribute();
  await loadSgovEntityToResource(entity, idProvider, result);
  await loadSgovCardinalities(entity, result);
  result.pimOwnerClass = idProvider.cimToPim(await entity.node(RDFS.domain));

  return result;
}
