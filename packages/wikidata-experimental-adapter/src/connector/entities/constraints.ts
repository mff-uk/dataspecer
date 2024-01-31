import type { EntityId, EntityIdsList } from './wd-entity';

export enum PropertyScopeValue {
  AS_MAIN = 0,
  AS_QUALIFIER = 1,
  AS_REFERENCE = 2,
}

export enum AllowedEntityTypesValue {
  ITEM = 0,
  PROPERTY = 1,
  LEXEME = 2,
  FORM = 3,
  SENSE = 4,
  MEDIA_INFO = 5,
}

export type StatementAllowanceMap = Record<string, EntityIdsList>;

export interface SubjectValueTypeContraint {
  readonly subclassOf: EntityIdsList;
  readonly instanceOf: EntityIdsList;
  readonly subclassOfInstanceOf: EntityIdsList;
}
export interface GeneralConstraints {
  readonly propertyScope: readonly PropertyScopeValue[];
  readonly allowedEntityTypes: readonly AllowedEntityTypesValue[];
  readonly allowedQualifiers: EntityIdsList;
  readonly requiredQualifiers: EntityIdsList;
  readonly conflictsWith: StatementAllowanceMap;
  readonly itemRequiresStatement: StatementAllowanceMap;
  readonly subjectType: SubjectValueTypeContraint;
}

export interface ItemTypeConstraints {
  readonly valueType: SubjectValueTypeContraint;
  readonly valueRequiresStatement: StatementAllowanceMap;
  readonly isSymmetric: boolean;
  readonly oneOf: EntityIdsList;
  readonly noneOf: EntityIdsList;
  readonly inverse: null | EntityId;
}

export type EmptyTypeConstraint = null;