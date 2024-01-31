
import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimClass } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";
import { IWdClass } from "../connector/entities/wd-class";
import { entityIdsToCimIds, loadWikidataEntityToResource } from "./wd-entity-adapter";
import { EntityTypes } from "../connector/entities/wd-entity";

export function loadWikidataClass(
    entity: IWdClass,
    iriProvider: IriProvider
  ): PimClass {
    const result = new PimClass();
    loadWikidataEntityToResource(entity, EntityTypes.CLASS, iriProvider, result);
    result.pimIsCodelist = false;
    result.pimExtends = entityIdsToCimIds(entity.subclassOf, EntityTypes.CLASS).map(iriProvider.cimToPim);
    return result;
}