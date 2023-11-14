
import { RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import { PimClass } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";
import { IWdClass } from "../connector/entities/wd-class";
import { entityIdsToPimIds, loadWikidataEntityToResource } from "./wd-entity-adapter";
import { EntityTypes } from "../connector/entities/wd-entity";

export function loadWikidataClass(
    entity: IWdClass,
    idProvider: IriProvider
  ): PimClass {
    const result = new PimClass();
    loadWikidataEntityToResource(entity, EntityTypes.CLASS, idProvider, result);
    result.pimIsCodelist = false;
    result.pimExtends = entityIdsToPimIds(entity.subclassOf, EntityTypes.CLASS);
    return result;
}