import {LanguageString} from "../../semantic-model/concepts";

/**
 * Package is de-facto a directory in the file system that contains other packages or models.
 *
 * Each package can have metadata (name, tags, authors), which are stored as a package metadata model, but are
 * interpreted as a part of the package interface.
 */
export interface Package {
    /**
     * Path-like identifier of the package
     */
    id: string;

    /**
     * Name of the package which can be extracted either from the package-metadata or from the
     * package identifier.
     */
    name: LanguageString;

    /**
     * Package tags that can be used for filtering, searching or organizing packages.
     * Each tag is a case-insensitive string, that does not need to be registered in advance.
     */
    tags: string[];

    /**
     * Packages that are contained in this package
     */
    subPackages: Package[];

    /**
     * Whether this package can be interpreted as "data specification"-specification providing semantic model.
     */
    providesSemanticModel: boolean;
}

/**
 * Package field that can be edited.
 */
export type PackageEditable = Omit<Package, "subPackages" | "providesSemanticModel">;

/**
 * Package that provides semantic model.
 */
interface SemanticModelPackage extends Package {

}