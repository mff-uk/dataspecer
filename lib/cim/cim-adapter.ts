import {PimClass} from "../platform-independent-model/model";
import {ReadOnlyMemoryStore} from "../core/store/memory-store/read-only-memory-store";

export interface CimAdapter {

    /**
     * Searches the CIM and returns an unordered list of PimClasses.
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
    getSurroundings(cimId: string): Promise<ReadOnlyMemoryStore>;

    /**
     * Returns a group(s) ids to which the class belongs to.
     * @param cimId CIM id of queried class
     */
    getClassGroup(cimId: string): Promise<string[] | null>;

}
