import {RdfSourceWrap} from "../../core/adapter/rdf";
import {asPimClass, PimClass} from "../../platform-independent-model/model";
import {POJEM, RDFS} from "../sgov-vocabulary";
import {loadSgovEntity} from "./sgov-entity-adapter";
import {IdProvider} from "../../cim/id-provider";

export async function isSgovClass(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(POJEM.typObjektu);
}

export async function loadSgovClass(entity: RdfSourceWrap, idProvider: IdProvider): Promise<PimClass> {
  const cls = asPimClass(await loadSgovEntity(entity, idProvider));

  const pimExtends = (await entity.nodes(RDFS.subClassOf)).map(idProvider.cimToPim);
  cls.pimExtends = [... new Set([...cls.pimExtends, ...pimExtends])];

  return cls;
}
