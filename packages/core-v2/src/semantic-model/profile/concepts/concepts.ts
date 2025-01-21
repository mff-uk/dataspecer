import { LanguageString, SemanticModelEntity } from "../../concepts";

export enum ProfiledItem {

  EntityName = "EntityName",

  EntityDescription = "EntityDescription" ,

  BinaryRelationRange = "BinaryRelationRange",

  BinaryRelationRangeCardinality = "BinaryRelationRangeCardinality",

  BinaryRelationDomain = "BinaryRelationDomain",

  BinaryRelationDomainCardinality = "BinaryRelationDomainCardinality",

  ProfileUsageNote = "ProfileUsageNote",

}

/**
 * Represents a profile relation.
 * A profiling entity express use of profiled entity in a user given context.
 *
 * The profiled entity can inherit, using profiledProperties,
 * values from the profiled entity.
 */
export interface SemanticModelProfile extends SemanticModelEntity {

    /**
     * User given information about the profile.
     */
    usageNote: LanguageString | null;

    /**
     * Identification of the profiled entity.
     */
    profiled: string;

    /**
     * Identification of profiling entity.
     */
    profiling: string;

    /**
     * Identification of properties that are used from the profiled entity.
     * This acts as a allow/white list.
     */
    profiledProperties: ProfiledItem[];

}

