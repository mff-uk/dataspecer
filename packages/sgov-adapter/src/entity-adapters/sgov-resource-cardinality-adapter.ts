import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimAssociationEnd, PimAttribute } from "@dataspecer/core/pim/model";
import { OWL } from "../sgov-vocabulary";

export async function loadSgovCardinalities(
  rdfEntity: RdfSourceWrap,
  pimResource: PimAttribute | PimAssociationEnd
) {
  const min = await rdfEntity.property(OWL.minQualifiedCardinality);
  if (min.length > 0) {
    pimResource.pimCardinalityMin = Number(min[0].value);
  }

  const max = await rdfEntity.property(OWL.maxQualifiedCardinality);
  if (max.length > 0) {
    pimResource.pimCardinalityMax = Number(max[0].value);
  }
}
