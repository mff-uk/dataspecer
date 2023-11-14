import { IWdEntity, EntityIdsList, ExternalOntologyMapping } from './wd-entity';

export const ROOT_CLASS_ID = 35120;

export interface IWdClass extends IWdEntity {
  readonly subclassOf: EntityIdsList;
  readonly children: EntityIdsList;
  readonly propertiesForThisType: EntityIdsList;
  readonly equivalentExternalOntologyClasses: ExternalOntologyMapping;
  readonly subjectOfProperty: EntityIdsList;
  readonly valueOfProperty: EntityIdsList;
}