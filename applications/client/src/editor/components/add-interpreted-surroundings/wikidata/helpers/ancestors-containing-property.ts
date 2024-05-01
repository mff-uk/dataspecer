import {
    WdClassHierarchySurroundingsDescOnly,
    WdClassSurroundings,
    WdPropertyDescOnly,
} from "@dataspecer/wikidata-experimental-adapter";
import { WikidataPropertyType } from "../wikidata-properties/wikidata-property-item";

export function getAncestorsContainingProperty(
    selectedWdClassSurroundings: WdClassSurroundings,
    wdProperty: WdPropertyDescOnly,
    wdPropertyType: WikidataPropertyType,
): WdClassHierarchySurroundingsDescOnly[] {
    const resultClasses: WdClassHierarchySurroundingsDescOnly[] = [];
    [selectedWdClassSurroundings.startClassId, ...selectedWdClassSurroundings.parentsIds].forEach(
        (classId) => {
            const cls = selectedWdClassSurroundings.classesMap.get(classId);
            if (cls != null) {
                let contains = false;
                if (wdPropertyType === WikidataPropertyType.BACKWARD_ASSOCIATIONS)
                    contains = cls.valueOfProperty.includes(wdProperty.id);
                else contains = cls.subjectOfProperty.includes(wdProperty.id);

                if (contains) resultClasses.push(cls);
            }
        },
    );
    return resultClasses;
}
