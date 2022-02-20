import { RdfSourceWrap } from "../../core/adapter/rdf";
import { PimAttribute } from "../../pim/model";
import { loadSgovEntityToResource } from "./sgov-entity-adapter";
import { POJEM, RDFS } from "../sgov-vocabulary";
import { IriProvider } from "../../cim";
import { loadSgovCardinalities } from "./sgov-resource-cardinality-adapter";

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
