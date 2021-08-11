import {PimClass} from "../../pim/pim-class";
import {Store} from "../../platform-model-store";

export interface CimAdapter {
    /**
     * Searches in the CIM source and returns an unordered list of PimClasses.
     * @param searchQuery Search query
     * @return List of PimClasses matching the search
     */
    search(searchQuery: string): Promise<PimClass[]>;

    /**
     * Returns a PimClass with interpretation to specified id.
     * @param cimId CIM id of class to be interpreted
     * @return Interpreted PIM class or null if the requested CIM class does not exists
     */
    getClass(cimId: string): Promise<PimClass | null>;

    /**
     * Get attributes and associations to a PIM class from CIM specified by CIM id.
     * @param cimId ID of CIM entity representing PIM class for which we look for attributes and associations
     * @return Store containing the PSM class and its surroundings
     */
    getSurroundings(cimId: string): Promise<Store>;

    /**
     * Returns full 'Isa' hierarchy for CIM entity
     * @param cimId
     * @return Store of PIM classes
     */
    getHierarchy(cimId: string): Promise<Store>;
}
