import type { IWdEntity, EntityIdsList, ExternalOntologyMapping } from './wd-entity';
import { type EmptyTypeConstraint, GeneralConstraints, type ItemTypeConstraints } from './constraints';

export enum UnderlyingType {
  ENTITY = 0,
  STRING = 1,
  TIME = 2,
  QUANTITY = 3,
  GLOBE_COORDINATE = 4,
}

export enum Datatype {
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

export interface IWdProperty extends IWdEntity {
  readonly datatype: Datatype;
  readonly underlyingType: UnderlyingType;
  readonly subpropertyOf: EntityIdsList;
  readonly relatedProperty: EntityIdsList;
  readonly equivalentExternalOntologyProperties: ExternalOntologyMapping;
  readonly generalConstraints: GeneralConstraints;

  readonly itemConstraints?: ItemTypeConstraints;
  readonly stringConstraints?: EmptyTypeConstraint;
  readonly quantityConstraints?: EmptyTypeConstraint;
  readonly timeConstraints?: EmptyTypeConstraint;
  readonly coordinatesConstraints?: EmptyTypeConstraint;
}
