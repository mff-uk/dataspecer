import { WdEntity, EntityIdsList, ExternalOntologyMapping } from './wd-entity';

export const ROOT_CLASS_ID = 35120;

export interface WdClass extends WdEntity {
  readonly subclassOf: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;

  readonly subjectOfProperty: EntityIdsList;
  readonly valueOfProperty: EntityIdsList;
}

export type WdClassDescOnly = Pick<WdClass, 'id' | 'iri' | 'labels' | 'descriptions'>;
export type WdClassHierarchyDescOnly = Pick<
  WdClass,
  'id' | 'iri' | 'labels' | 'descriptions' | 'subclassOf'
>;
export type WdClassHierarchySurroundingsDescOnly = Pick<
  WdClass,
  'id' | 'iri' | 'labels' | 'descriptions' | 'subclassOf' | 'subjectOfProperty' | 'valueOfProperty'
>;
