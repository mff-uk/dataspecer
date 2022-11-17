import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimClass } from "@dataspecer/core/pim/model";
import { POJEM, RDFS } from "../sgov-vocabulary";
import { loadSgovEntityToResource } from "./sgov-entity-adapter";
import { IriProvider } from "@dataspecer/core/cim";

export async function isSgovClass(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typObjektu);
}

export async function loadSgovClass(
  entity: RdfSourceWrap,
  idProvider: IriProvider
): Promise<PimClass> {
  const result = new PimClass();
  await loadSgovEntityToResource(entity, idProvider, result);
  result.pimIsCodelist =
    (await entity.property("__is_ciselnik"))[0]?.value === "1";

  result.pimExtends = unique([
    ...result.pimExtends,
    ...(await entity.nodes(RDFS.subClassOf)).map(idProvider.cimToPim),
  ]);

  return result;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
