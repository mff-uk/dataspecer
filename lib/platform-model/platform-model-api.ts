import {EntitySource} from "../rdf/entity-source";

/**
 * We allow only one value for each language.
 */
export type LanguageString = Record<string, string>;

/**
 * Base model class. We do not need to store order as JavaScript arrays
 * do that for us.
 */
export class ModelResource {

  /**
   * Types used by the application, single resource can be of multiple
   * application types like PimClass, PimAttribute, etc..
   */
  readonly types: string[] = [];

  /**
   * Resource identifier i.e. IRI.
   */
  readonly id: string;

  readonly rdfTypes: string[];

  constructor(id: string, rdfTypes: string[] = []) {
    this.id = id;
    this.rdfTypes = rdfTypes;
  }

}

/**
 * Loader class interface. Does not perform data validation, just
 * load properties for resources of given type.
 */
export interface ModelLoader {

  canLoadResource(resource: ModelResource): boolean;

  loadIntoResource(
    source: EntitySource, resource: ModelResource
  ): Promise<string[]>;

}
