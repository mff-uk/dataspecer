import jsStringEscape from "js-string-escape";
import search from "./queries/search.sparql";
import getClass from "./queries/get-class.sparql";
import getSurroundingsAttributes from "./queries/get-surroundings-attributes.sparql";
import getSurroundingsInwardsRelations from "./queries/get-surroundings-inwards-relations.sparql";
import getSurroundingsOutwardsRelations from "./queries/get-surroundings-outwards-relations.sparql";
import getSurroundingsParent from "./queries/get-surroundings-parent.sparql";
import getSurroundingsComplexAttributes from "./queries/get-surroundings-complex-attributes.sparql";
import getHierarchy from "./queries/get-hierarchy.sparql";
import {CimAdapter} from "../cim";
import {SparqlQueryRdfSource} from "../io/rdf/sparql/sparql-query-rdf-source";
import {HttpFetch} from "../io/fetch/fetch-api";
import {RdfSource, RdfSourceWrap} from "../core/adapter/rdf";
import {isSgovClass, loadSgovClass} from "./entity-adapters/sgov-class-adapter";
import {ReadOnlyMemoryStore} from "../core/store/memory-store/read-only-memory-store";
import {FederatedSource} from "../io/rdf/federated/federated-rdf-source";
import {CoreResource} from "../core";
import {POJEM, RDFS, SKOS} from "./sgov-vocabulary";
import {isSgovAssociation, loadSgovAssociation} from "./entity-adapters/sgov-association-adapter";
import {isSgovAttribute, loadSgovAttribute} from "./entity-adapters/sgov-attribute-adapter";
import {PimClass} from "../platform-independent-model/model";
import {IdProvider} from "../cim/id-provider";

const getSurroundings = [
  getSurroundingsAttributes,
  getSurroundingsInwardsRelations,
  getSurroundingsOutwardsRelations,
  getSurroundingsParent,
  getSurroundingsComplexAttributes,
];

const compressQueryString = (query: string): string => {
  return query.replace(/^\s*#.*$/mg, "").replace(/[ \t]+/g, " ");
};

const searchQuery = (searchString: string) => compressQueryString(search.replace("%QUERY%", `"${jsStringEscape(searchString)}"`));
const getClassQuery = (id: string) => compressQueryString(getClass.replace(/%NODE%/g, `<${id}>`));
const getSurroundingsQueries = (id: string) => getSurroundings.map(q => compressQueryString(q.replace(/%NODE%/g, `<${id}>`)));
const getHierarchyQuery = (id: string) => compressQueryString(getHierarchy.replace(/%NODE%/g, `<${id}>`));

const IRI_REGEXP = new RegExp("^https?://");

/**
 * Adapter for SGOV (Semantic Government Vocabulary) CIM type.
 *  - https://slovník.gov.cz/sparql
 */
export class SgovAdapter implements CimAdapter {
  protected readonly endpoint: string;
  protected readonly httpFetch: HttpFetch;
  protected readonly idProvider: IdProvider;

  protected classGroupCache = new Map<string, string[] | undefined>();

  constructor(endpoint: string, httpFetch: HttpFetch, idProvider: IdProvider) {
    this.endpoint = endpoint;
    this.httpFetch = httpFetch;
    this.idProvider = idProvider;
  }

  async search(searchString: string): Promise<PimClass[]> {
    const source = new SparqlQueryRdfSource(this.httpFetch, this.endpoint, searchQuery(searchString));
    await source.query();

    const results = await source.property("__search_results", "__has_search_result");

    let sorted = [];
    for (const result of results) {
      const resultWrap = RdfSourceWrap.forIri(result.value, source);
      await this.cacheClassGroup(resultWrap);
      sorted.push({
        sort: Number((await resultWrap.property("__order"))[0].value),
        cls: await loadSgovClass(resultWrap, this.idProvider),
      });
    }
    sorted = sorted.sort((a, b) => a.sort - b.sort).map(p => p.cls);

    if (IRI_REGEXP.test(searchString)) {
      const classById = await this.getClass(searchString);
      if (classById) {
        sorted = [classById, ...sorted];
      }
    }

    return sorted;
  }

  async getClass(cimId: string): Promise<PimClass | null> {
    const source = new SparqlQueryRdfSource(this.httpFetch, this.endpoint, getClassQuery(cimId));
    await source.query();
    const entity = RdfSourceWrap.forIri(cimId, source);

    if (!await isSgovClass(entity)) {
      return null;
    }
    await this.cacheClassGroup(RdfSourceWrap.forIri(cimId, source));
    return await loadSgovClass(entity, this.idProvider);
  }

  async getSurroundings(cimId: string): Promise<ReadOnlyMemoryStore> {
    const sources = getSurroundingsQueries(cimId).map(query => new SparqlQueryRdfSource(this.httpFetch, this.endpoint, query));
    await Promise.all(sources.map(q => q.query()));
    const source = FederatedSource.createExhaustive(sources);
    const resources = await this.loadPimEntitiesGraphFromEntity(cimId, source);
    return new ReadOnlyMemoryStore(resources);
  }

  public async getHierarchy(cimId: string): Promise<ReadOnlyMemoryStore> {
    const source = new SparqlQueryRdfSource(this.httpFetch, this.endpoint, getHierarchyQuery(cimId));
    await source.query();
    const resources = await this.loadPimEntitiesGraphFromEntity(cimId, source);
    return new ReadOnlyMemoryStore(resources);
  }

  /**
   * Returns a glossary info for the class.
   * @param cimId
   */
  public async getClassGroup(cimId: string): Promise<string[] | null> {
    if (this.classGroupCache.has(cimId)) {
      return this.classGroupCache.get(cimId);
    } else {
      const source = new SparqlQueryRdfSource(this.httpFetch, this.endpoint, getClassQuery(cimId));
      await source.query();
      return await this.cacheClassGroup(RdfSourceWrap.forIri(cimId, source));
    }
  }

  /**
   * Takes an RdfSource and CIM id of a class. From the class it loads everything accessible (associations, attributes and parents) and returns all the entities.
   */
  protected async loadPimEntitiesGraphFromEntity(rootClassCimId: string, source: RdfSource): Promise<{ [iri: string]: CoreResource }> {
    const resources: { [iri: string]: CoreResource } = {};

    const classesProcessed = new Set<string>();
    const associationsProcessed = new Set<string>();
    // List of CIM ids to process
    let processQueue: string[] = [rootClassCimId];
    while (processQueue.length) {
      const processedCimId = processQueue.pop();
      if (classesProcessed.has(processedCimId)) {
        continue;
      }
      classesProcessed.add(processedCimId);

      // Class itself

      const rdfClassWrap = RdfSourceWrap.forIri(processedCimId, source);
      const pimClass = await loadSgovClass(rdfClassWrap, this.idProvider);
      resources[pimClass.iri] = pimClass;

      // Some classes may be empty because of simplification of SPARQL queries.
      // Therefore we need to check, if it is actually a class and containing a group information.
      if (await isSgovClass(rdfClassWrap)) {
        await this.cacheClassGroup(rdfClassWrap);
      }

      // Process associations for the class and add class from the other side of the association to `processQueue`

      const associations = [...await rdfClassWrap.reverseNodes(RDFS.domain), ...await rdfClassWrap.reverseNodes(RDFS.range)];
      for (const cimAssociationId of associations) {
        const entity = RdfSourceWrap.forIri(cimAssociationId, source);
        if (associationsProcessed.has(cimAssociationId) || !await isSgovAssociation(entity)) {
          continue;
        }
        associationsProcessed.add(cimAssociationId);

        const pimAssociation = await loadSgovAssociation(entity, this.idProvider);
        resources[pimAssociation.iri] = pimAssociation;

        // Add linked classes to the processQueue

        processQueue.push(await entity.node(RDFS.domain));
        processQueue.push(await entity.node(RDFS.range));
      }

      // Process attributes for the current class

      const attributes = await rdfClassWrap.reverseNodes(RDFS.domain);
      for (const cimAttributeId of attributes) {
        const entity = RdfSourceWrap.forIri(cimAttributeId, source);
        if (!await isSgovAttribute(entity)) {
          continue;
        }
        const pimAttribute = await loadSgovAttribute(entity, this.idProvider);
        resources[pimAttribute.iri] = pimAttribute;
      }

      // Process class hierarchy

      processQueue = [...processQueue, ...pimClass.pimExtends];
    }

    return resources;
  }

  protected async cacheClassGroup(entity: RdfSourceWrap): Promise<string[] | undefined> {
    let classGroup: string[] | undefined = undefined;
    if ((await entity.types()).includes(POJEM.typObjektu)) {
      classGroup = await entity.nodes(SKOS.inScheme);
    }

    this.classGroupCache.set(entity.id(), classGroup);
    return classGroup;
  }

}
