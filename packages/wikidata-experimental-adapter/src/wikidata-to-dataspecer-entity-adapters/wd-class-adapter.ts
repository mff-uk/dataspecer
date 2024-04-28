import { PimClass } from "@dataspecer/core/pim/model";
import { IriProvider } from "@dataspecer/core/cim";
import { loadWikidataEntityToResource } from "./wd-entity-adapter";
import { WdClassHierarchyDescOnly } from "../wikidata-entities/wd-class";
import { WdEntityId, concatWdPrefixWithId } from "../wikidata-entities/wd-entity";

export function loadWikidataClass(
    cls: WdClassHierarchyDescOnly,
    iriProvider: IriProvider,
    contextClasses: ReadonlyMap<WdEntityId, WdClassHierarchyDescOnly> | undefined = undefined,
): PimClass {
    const result = new PimClass();
    loadWikidataEntityToResource(cls, iriProvider, result);
    result.pimIsCodelist = false;
    result.pimExtends = cls.subclassOf.map((clsId) => {
        let cimIri = "";
        if (contextClasses != null) cimIri = contextClasses.get(clsId)?.iri;
        if (cimIri === "" || cimIri == null) cimIri = concatWdPrefixWithId("Q" + clsId.toString());
        return iriProvider.cimToPim(cimIri);
    });
    return result;
}
