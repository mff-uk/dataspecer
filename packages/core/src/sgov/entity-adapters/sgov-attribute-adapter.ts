import {RdfSourceWrap} from "../../core/adapter/rdf";
import {PimAttribute} from "../../pim/model";
import {loadSgovEntityToResource} from "./sgov-entity-adapter";
import {OWL, POJEM, RDFS} from "../sgov-vocabulary";
import {IriProvider} from "../../cim";

export async function isSgovAttribute(
  entity: RdfSourceWrap,
): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typVlastnosti);
}

export async function loadSgovAttribute(
  entity: RdfSourceWrap, idProvider: IriProvider,
): Promise<PimAttribute> {
  const result = new PimAttribute();
  await loadSgovEntityToResource(entity, idProvider, result);

  const min = await entity.property(OWL.minQualifiedCardinality);

  if (min.length > 0) {
    result.pimCardinalityMin = Number(min[0].value);
  }

  const max = await entity.property(OWL.maxQualifiedCardinality);
  if (max.length > 0) {
    result.pimCardinalityMax = Number(max[0].value);
  }

  result.pimOwnerClass = idProvider.cimToPim(await entity.node(RDFS.domain));

  return result;
}
