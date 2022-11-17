import jsStringEscape from "js-string-escape";
import search from "./queries/search.sparql";
import getClass from "./queries/get-class.sparql";
import getSurroundingsAttributes from "./queries/get-surroundings-attributes.sparql";
import getSurroundingsInwardsRelations from "./queries/get-surroundings-inwards-relations.sparql";
import getSurroundingsOutwardsRelations from "./queries/get-surroundings-outwards-relations.sparql";
import getSurroundingsParent from "./queries/get-surroundings-parent.sparql";
import getSurroundingsComplexAttributes from "./queries/get-surroundings-complex-attributes.sparql";
import getHierarchy from "./queries/get-hierarchy.sparql";
import getGroup from "./queries/get-group.sparql";
import { CimAdapter, IriProvider } from "@dataspecer/core/cim";
import { SparqlQueryRdfSource } from "@dataspecer/core/io/rdf/sparql/sparql-query-rdf-source";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { RdfSource, RdfSourceWrap } from "@dataspecer/core/core/adapter/rdf";
import {
  isSgovClass,
  loadSgovClass,
} from "./entity-adapters/sgov-class-adapter";
import { CoreResource, ReadOnlyMemoryStore } from "@dataspecer/core/core";
import { FederatedSource } from "@dataspecer/core/io/rdf/federated/federated-rdf-source";
import { RDFS, SKOS } from "./sgov-vocabulary";
import {
  isSgovAssociation,
  loadSgovAssociation,
} from "./entity-adapters/sgov-association-adapter";
import {
  isSgovAttribute,
  loadSgovAttribute,
} from "./entity-adapters/sgov-attribute-adapter";
import { PimClass } from "@dataspecer/core/pim/model";

const getSurroundings = [
  getSurroundingsAttributes,
  getSurroundingsInwardsRelations,
  getSurroundingsOutwardsRelations,
  getSurroundingsParent,
  getSurroundingsComplexAttributes,
];

const searchQuery = (searchString: string) => search({query: `"${jsStringEscape(searchString)}"`});

const getClassQuery = (cimIri: string) => getClass({node: `<${cimIri}>`});

const getHierarchyQuery = (cimIri: string) => getHierarchy({node: `<${cimIri}>`});

const getGroupQuery = (cimIri: string) => getGroup({node: `<${cimIri}>`});

const getSurroundingsQueries = (cimIri: string) => getSurroundings.map(q => q({node: `<${cimIri}>`}));

const IRI_REGEXP = new RegExp("^https?://");

/**
 * Adapter for SGOV (Semantic Government Vocabulary) CIM type.
 *  - https://slovník.gov.cz/sparql
 */
export class SgovAdapter implements CimAdapter {
  protected readonly endpoint: string;
  protected readonly httpFetch: HttpFetch;
  protected iriProvider: IriProvider;

  protected resourceGroupCache = new Map<string, string[] | undefined>();

  constructor(endpoint: string, httpFetch: HttpFetch) {
    this.endpoint = endpoint;
    this.httpFetch = httpFetch;
  }

  setIriProvider(iriProvider: IriProvider): void {
    this.iriProvider = iriProvider;
  }

  async search(searchString: string): Promise<PimClass[]> {
    if (!this.iriProvider) {
      throw new Error("Missing IRI provider.");
    }

    const source = new SparqlQueryRdfSource(
      this.httpFetch,
      this.endpoint,
      searchQuery(searchString)
    );
    await source.query();

    const results = await source.property(
      "__search_results",
      "__has_search_result"
    );

    let sorted = [];
    for (const result of results) {
      const resultWrap = RdfSourceWrap.forIri(result.value, source);
      await this.cacheResourceGroup(resultWrap);
      sorted.push({
        sort: Number((await resultWrap.property("__order"))[0].value),
        cls: await loadSgovClass(resultWrap, this.iriProvider),
      });
    }
    sorted = sorted.sort((a, b) => a.sort - b.sort).map((p) => p.cls);

    if (IRI_REGEXP.test(searchString)) {
      const classByIri = await this.getClass(searchString);
      if (classByIri) {
        sorted = [classByIri, ...sorted];
      }
    }

    return sorted;
  }

  async getClass(cimIri: string): Promise<PimClass | null> {
    if (!this.iriProvider) {
      throw new Error("Missing IRI provider.");
    }

    const source = new SparqlQueryRdfSource(
      this.httpFetch,
      this.endpoint,
      getClassQuery(cimIri)
    );
    await source.query();
    const entity = RdfSourceWrap.forIri(cimIri, source);

    if (!(await isSgovClass(entity))) {
      return null;
    }
    await this.cacheResourceGroup(RdfSourceWrap.forIri(cimIri, source));
    return await loadSgovClass(entity, this.iriProvider);
  }

  async getSurroundings(cimIri: string): Promise<ReadOnlyMemoryStore> {
    if (!this.iriProvider) {
      throw new Error("Missing IRI provider.");
    }

    const sources = getSurroundingsQueries(cimIri).map(
      (query) => new SparqlQueryRdfSource(this.httpFetch, this.endpoint, query)
    );

    await Promise.all(sources.map((q) => q.query()));
    const source = FederatedSource.createExhaustive(sources);
    const resources = await this.loadPimEntitiesGraphFromEntity(cimIri, source);
    return ReadOnlyMemoryStore.create(resources);
  }

  /**
   * Returns full known hierarchy structure - containing all ancestors and
   * descendants of the given class.
   * @param cimIri class CIM IRI
   */
  public async getFullHierarchy(cimIri: string): Promise<ReadOnlyMemoryStore> {
    if (!this.iriProvider) {
      throw new Error("Missing IRI provider.");
    }

    const source = new SparqlQueryRdfSource(
      this.httpFetch,
      this.endpoint,
      getHierarchyQuery(cimIri)
    );
    await source.query();
    const resources = await this.loadPimEntitiesGraphFromEntity(cimIri, source);
    return ReadOnlyMemoryStore.create(resources);
  }

  /**
   * Returns a glossary info for the resource.
   * @param cimIri
   */
  public async getResourceGroup(cimIri: string): Promise<string[]> {
    if (!this.iriProvider) {
      throw new Error("Missing IRI provider.");
    }

    if (this.resourceGroupCache.has(cimIri)) {
      return this.resourceGroupCache.get(cimIri);
    } else {
      const source = new SparqlQueryRdfSource(
        this.httpFetch,
        this.endpoint,
        getGroupQuery(cimIri)
      );
      await source.query();
      return await this.cacheResourceGroup(
        RdfSourceWrap.forIri(cimIri, source)
      );
    }
  }

  /**
   * Takes an RdfSource and CIM iri of a class. From the class it loads
   * everything accessible (associations, attributes and parents) and
   * returns all the entities.
   */
  protected async loadPimEntitiesGraphFromEntity(
    rootClassCimIri: string,
    source: RdfSource
  ): Promise<{ [iri: string]: CoreResource }> {
    const resources: { [iri: string]: CoreResource } = {};

    const classesProcessed = new Set<string>();
    const associationsProcessed = new Set<string>();

    // Reverse lookup for classes that are descendants of the given class.
    const descendants = [rootClassCimIri];
    let processedDescendant = 0;
    while (processedDescendant < descendants.length) {
      const descendant = descendants[processedDescendant];
      const res = await source.reverseProperty(RDFS.subClassOf, descendant);
      for (const r of res) {
        if (!descendants.includes(r.value)) {
          descendants.push(r.value);
        }
      }
      processedDescendant++;
    }

    // List of CIM iris to process
    let processQueue: string[] = [rootClassCimIri, ...descendants];
    while (processQueue.length) {
      const processedCimIri = processQueue.pop();
      if (classesProcessed.has(processedCimIri)) {
        continue;
      }
      classesProcessed.add(processedCimIri);

      // Class itself

      const rdfClassWrap = RdfSourceWrap.forIri(processedCimIri, source);
      const pimClass = await loadSgovClass(rdfClassWrap, this.iriProvider);
      resources[pimClass.iri] = pimClass;

      // Some classes may be empty because of simplification of SPARQL queries.
      // Therefore, we need to check, if it is actually a class and containing
      // a group information.
      if (await isSgovClass(rdfClassWrap)) {
        await this.cacheResourceGroup(rdfClassWrap);
      }

      // Process associations for the class and add class from the other side
      // of the association to `processQueue`

      const associations = [
        ...(await rdfClassWrap.reverseNodes(RDFS.domain)),
        ...(await rdfClassWrap.reverseNodes(RDFS.range)),
      ];
      for (const cimAssociationIri of associations) {
        const entity = RdfSourceWrap.forIri(cimAssociationIri, source);
        if (
          associationsProcessed.has(cimAssociationIri) ||
          !(await isSgovAssociation(entity))
        ) {
          continue;
        }
        associationsProcessed.add(cimAssociationIri);

        const associationResources = await loadSgovAssociation(
          entity,
          source,
          this.iriProvider
        );
        associationResources.forEach((r) => (resources[r.iri] = r));

        // Add linked classes to the processQueue

        processQueue.push(await entity.node(RDFS.domain));
        processQueue.push(await entity.node(RDFS.range));
      }

      // Process attributes for the current class

      const attributes = await rdfClassWrap.reverseNodes(RDFS.domain);
      for (const cimAttributeIri of attributes) {
        const entity = RdfSourceWrap.forIri(cimAttributeIri, source);
        if (!(await isSgovAttribute(entity))) {
          continue;
        }
        const pimAttribute = await loadSgovAttribute(entity, this.iriProvider);
        resources[pimAttribute.iri] = pimAttribute;
      }

      // Process class hierarchy

      processQueue = [
        ...processQueue,
        ...pimClass.pimExtends.map(this.iriProvider.pimToCim),
      ];
    }

    return resources;
  }

  protected async cacheResourceGroup(entity: RdfSourceWrap): Promise<string[]> {
    const groups = await entity.nodes(SKOS.inScheme);
    this.resourceGroupCache.set(entity.iri, groups);
    return groups;
  }
}
