import { WdEntityIdsList, WdExternalOntologyMappings, WdEntity } from "./wd-entity";

export enum WdUnderlyingType {
    ENTITY = 0,
    STRING = 1,
    TIME = 2,
    QUANTITY = 3,
    GLOBE_COORDINATE = 4,
}

export enum WdDatatype {
    ITEM = 0,
    PROPERTY = 1,
    LEXEME = 2,
    SENSE = 3,
    FORM = 4,
    MONOLINGUAL_TEXT = 5,
    STRING = 6,
    EXTERNAL_IDENTIFIER = 7,
    URL = 8,
    COMMONS_MEDIA_FILE = 9,
    GEOGRAPHIC_SHAPE = 10,
    TABULAR_DATA = 11,
    MATHEMATICAL_EXPRESSION = 12,
    MUSICAL_NOTATION = 13,
    QUANTITY = 14,
    POINT_IN_TIME = 15,
    GEOGRAPHIC_COORDINATES = 16,
}

export interface WdProperty extends WdEntity {
    readonly datatype: WdDatatype;
    readonly underlyingType: WdUnderlyingType;
    readonly subpropertyOf: WdEntityIdsList;
    readonly relatedProperty: WdEntityIdsList;
    readonly equivalentExternalOntologyProperties: WdExternalOntologyMappings;
    readonly inverseProperty: WdEntityIdsList;
    readonly complementaryProperty: WdEntityIdsList;
    readonly negatesProperty: WdEntityIdsList;
    readonly subproperties: WdEntityIdsList;
    readonly generalConstraints: WdGeneralConstraints;

    readonly itemConstraints?: WdItemTypeConstraints;
    readonly stringConstraints?: WdEmptyTypeConstraint;
    readonly quantityConstraints?: WdEmptyTypeConstraint;
    readonly timeConstraints?: WdEmptyTypeConstraint;
    readonly coordinatesConstraints?: WdEmptyTypeConstraint;
}

export type WdPropertyDescOnly = Pick<
    WdProperty,
    "id" | "iri" | "labels" | "descriptions" | "datatype" | "underlyingType"
>;

export interface WdGeneralConstraints {
    readonly subjectTypeStats: WdEntityIdsList;
}

export interface WdItemTypeConstraints {
    readonly valueTypeStats: WdEntityIdsList;
}

export type WdEmptyTypeConstraint = null;
