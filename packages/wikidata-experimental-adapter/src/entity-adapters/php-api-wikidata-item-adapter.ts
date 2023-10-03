import { PimClass } from "@dataspecer/core/pim/model";
import { WikidataItemPhpWrap, loadWikidataEntityFromPhpWrapToResource } from "./php-api-wikidata-entity-adapter";
import { IriProvider } from "@dataspecer/core/cim";


export async function isWikidataItemPhp(entity: WikidataItemPhpWrap): Promise<boolean> {
    return entity.getEntityType() === 'item';
}
  
export async function loadWikidataItemFromPhpWrap(
    entity: WikidataItemPhpWrap,
    idProvider: IriProvider
): Promise<PimClass> {
    const result = new PimClass();
    await loadWikidataEntityFromPhpWrapToResource(entity, idProvider, result);
    result.pimIsCodelist = false;
    result.pimExtends = unique(entity.getParents().map(idProvider.cimToPim));
    return result;
}
    
function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}
