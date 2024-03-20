
export interface RdfsClass {
    iri: string;
}

export interface RdfsProperty {
    iri: string;
}

export interface RdfsDatatype {
    iri: string;
}

// @lc-identifier dcterms:Standard
export interface DataSpecification {
    iri: string;
    // @lc-identifier pav:previousVersion
    previousVersion: DataSpecification | null;
    // @lc-identifier pav:derivedFrom
    reUsedSpecification: DataSpecification[];
    // @lc-identifier dsv:ControlledVocabulary
    controlledVocabulary: ControlledVocabulary[];
    // @lc-identifier dsv:dataStructure
    dataStructure: DataStructure[];
    // @lc-identifier dsv:artefact
    artefact: ResourceDescriptor[];
}

// @lc-identifier prof:Profile
export interface ApplicationProfile extends DataSpecification {
    // @lc-identifier dsv:model
    conceptualModel: ConceptualModel[];
}

// @lc-identifier dsv:Profile
interface Profile {
    iri: string;
    // @lc-identifier dsv:profileOf
    profileOf: Profile | null;
    // @lc-identifier dsv:specializes
    specializes: Profile | null;
}

// @lc-identifier dsv:InvalidProfile
export interface InvalidProfile extends Profile {

}

// @lc-identifier dsv:ClassProfile
export interface ClassProfile extends Profile {
    // @lc-identifier dsv:class
    profiledClass: RdfsClass | null;
}

// @lc-identifier dsv:PropertyProfile 
export interface PropertyProfile extends Profile {
    // @lc-identifier dsv:property
    profiledProperty: RdfsProperty | null;
    // @lc-identifier dsv:domain
    domain: ClassProfile[];
    // @lc-identifier dsv:requiredVocabulary
    requiredVocabulary: ControlledVocabulary[];
    // @lc-identifier dsv:additionalVocabulary
    additionalVocabulary: ControlledVocabulary[];
}

// @lc-identifier dsv:ObjectPropertyProfile
export interface ObjectPropertyProfile extends PropertyProfile {
    iri: string;
    // @lc-identifier dsv:objectPropertyRange
    range: ClassProfile[];
}

// @lc-identifier dsv:DatatypePropertyProfile
export interface DatatypePropertyProfile extends PropertyProfile {
    iri: string;
    // @lc-identifier dsv:datatypePropertyRange
    range: RdfsDatatype[];
}

// @lc-identifier dsv:ControlledVocabulary
export interface ControlledVocabulary { // extends skos:ConceptScheme
    iri: string;
}

// @lc-identifier dsv:ControlledVocabularyRequirementType
export interface ControlledVocabularyRequirementType { // extends skos:ConceptScheme
    iri: string;
}

// @lc-identifier dsv:ConceptualModel
export interface ConceptualModel {
    iri: string;
    //
    classes: ClassProfile[];
}

// @lc-identifier dsv:DataStructure
export interface DataStructure {
    iri: string;
}

// @lc-identifier prof:ResourceDescriptor
export interface ResourceDescriptor {
    iri: string;
}
