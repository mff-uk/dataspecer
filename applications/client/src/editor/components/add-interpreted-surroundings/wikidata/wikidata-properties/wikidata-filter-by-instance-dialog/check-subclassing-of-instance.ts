import { WdClassSurroundings, WdFilterByInstance } from "@dataspecer/wikidata-experimental-adapter";

export function isValidSubclassingOfWdFilterByInstance(
    selectedWdClassSurroundings: WdClassSurroundings, wdFilterByInstance: WdFilterByInstance | undefined
): boolean {
    if (wdFilterByInstance !== undefined) {
        // The selected class is not part of the instance hierarchy.
        const isSelectedClassSubclassOfTheInstanceClass = 
            wdFilterByInstance.classIdsHierarchy.includes(selectedWdClassSurroundings.startClassId);

        // The classes of the instance are not the subclasses of the currently selected class.
        const areSomeInstanceClassesSubclassesOfSelectedClass = 
            [selectedWdClassSurroundings.startClassId, ...selectedWdClassSurroundings.parentsIds]
                .some((value) => wdFilterByInstance.instanceOfIds.includes(value));
    
        if (!isSelectedClassSubclassOfTheInstanceClass && !areSomeInstanceClassesSubclassesOfSelectedClass) {
            return false;
        }
    }
    return true;
}