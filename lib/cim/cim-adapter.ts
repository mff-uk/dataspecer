import {PimClass} from "../pim/model";
import {CoreResourceReader} from "../core";
import {IriProvider} from "./iri-provider";

export interface CimAdapter {

    /**
     * Resources returned by the adapter are on the PIM level, therefore the PIM IRIs are needed to interconnect them.
     * Also, the IRIs need to be predictable and revertible so the user is able to get CIM iri from PIM iri.
     * @param iriProvider
     */
    setIriProvider(iriProvider: IriProvider): void;

    /**
     * Searches the CIM and returns an ordered list of PimClasses.
     * @param searchQuery Search query
     * @return List of PimClasses matching the search
     */
    search(searchQuery: string): Promise<PimClass[]>;

    /**
     * Returns a PimClass by CIM iri.
     * @param cimIri CIM iri of class to be interpreted.
     * @return Interpreted PIM class or null if the requested CIM class does not exists
     */
    getClass(cimIri: string): Promise<PimClass | null>;

    /**
     * Get attributes and associations (in distance 1) to a PIM class from CIM specified by CIM iri.
     * @param cimIri iri of CIM entity representing PIM class for which we look for attributes and associations
     * @return Store containing the PSM class and its surroundings
     */
    getSurroundings(cimIri: string): Promise<CoreResourceReader>;

    /**
     * Returns full (for every class there is also every parent of the class) 'Isa' hierarchy for CIM resource.
     * @param cimIri
     * @return Store of PIM classes
     */
    getFullHierarchy(cimIri: string): Promise<CoreResourceReader>;

    /**
     * Returns a group(s) iris to which the resource belongs to.
     * @param cimIri CIM iri of queried resource
     * @return unordered array of group CIM iris
     */
    getResourceGroup(cimIri: string): Promise<string[]>;

}
