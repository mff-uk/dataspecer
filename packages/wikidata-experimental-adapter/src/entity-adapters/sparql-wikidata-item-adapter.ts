
import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimClass } from "@dataspecer/core/pim/model";
import { RDFS, WIKIDATA } from "../vocabulary";
import { loadWikidataEntityToResource } from "./sparql-wikidata-entity-adapter";
import { IriProvider } from "@dataspecer/core/cim";

export async function isWikidataItem(entity: RdfSourceWrap): Promise<boolean> {
  return (await entity.types()).includes(WIKIDATA.item);
}

export async function loadWikidataItem(
    entity: RdfSourceWrap,
    idProvider: IriProvider
  ): Promise<PimClass> {
    
    const result = new PimClass();
    await loadWikidataEntityToResource(entity, idProvider, result);
    
    result.pimIsCodelist = false;
    result.pimExtends = unique([
      ...result.pimExtends,
      ...(await entity.nodes(RDFS.subClassOf)).map(idProvider.cimToPim),
    ]);
  
    return result;
  }
  
  function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
  }