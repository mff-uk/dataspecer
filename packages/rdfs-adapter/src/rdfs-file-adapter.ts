import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {RdfHttpSource} from "@dataspecer/core/io/rdf/http/http-rdf-source";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {RdfSource, RdfSourceWrap} from "@dataspecer/core/core/adapter/rdf";
import {isRdfsClass, loadRdfsClass} from "./entity-adapters/rdfs-class-adapter";
import {RDF, RDFS, SCHEMAORG} from "./rdfs-vocabulary";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {loadRdfsEntityToResource} from "./entity-adapters/rdfs-entity-adapter";
import {PimAssociation, PimAssociationEnd, PimAttribute} from "@dataspecer/core/pim/model";

/**
 * CIM adapter that reads RDFS or RDFS-like vocabularies a single file on the Internet.
 */
export class RdfsFileAdapter implements CimAdapter {
    protected readonly urls: string[];
    protected readonly httpFetch: HttpFetch;
    protected source: Promise<RdfHttpSource> | null = null;
    protected iriProvider!: IriProvider;

    public options = {
        classType: RDFS.Class,
        propertyDomain: [RDFS.domain],
        propertyDomainIncludes: [SCHEMAORG.domainIncludes],
        propertyRange: [RDFS.range],
        propertyRangeIncludes: [SCHEMAORG.rangeIncludes],
    }

    constructor(url: string[], httpFetch: HttpFetch) {
        this.urls = url;
        this.httpFetch = httpFetch;
    }

    setIriProvider(iriProvider: IriProvider): void {
        this.iriProvider = iriProvider;
    }

    /**
     * Initializes fetching and returns fetched store
     */
    protected getFetchedSource(): Promise<RdfHttpSource> {
        const fetchSource = async () => {
            const source = new RdfHttpSource();
            for (const url of this.urls) {
                await source.fetch(this.httpFetch, url, undefined);
            }
            return source;
        }

        if (this.source === null) {
            this.source = fetchSource();
        }

        return this.source
    }

    // todo this is copy from sgov
    protected async loadPimEntitiesGraphFromEntity(
        rootClassCimIri: string,
        source: RdfSource
    ): Promise<{ [iri: string]: CoreResource }> {
        const resources: { [iri: string]: CoreResource } = {};

        const classesProcessed = new Set<string>();
        const propertiesProcessed = new Set<string>();

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
            const processedCimIri = processQueue.pop()!;
            if (classesProcessed.has(processedCimIri)) {
                continue;
            }
            classesProcessed.add(processedCimIri);

            // Class itself

            const rdfClassWrap = RdfSourceWrap.forIri(processedCimIri, source);
            const pimClass = await loadRdfsClass(rdfClassWrap, this.iriProvider);
            resources[pimClass.iri!] = pimClass;

            // Some classes may be empty because of simplification of SPARQL queries.
            // Therefore, we need to check, if it is actually a class and containing
            // a group information.
//            if (await isRdfsClass(rdfClassWrap)) {
//                await this.cacheResourceGroup(rdfClassWrap);
//            }

            // Process associations for the class and add class from the other side
            // of the association to `processQueue`

            // List of IRIs that are associations of the class

            const propertyIris = [] as string[];
            const edgeProps = [
                ...this.options.propertyDomain,
                ...this.options.propertyDomainIncludes,
                ...this.options.propertyRange,
                ...this.options.propertyRangeIncludes
            ];
            for (const edgeProp of edgeProps) {
                propertyIris.push(...await rdfClassWrap.reverseNodes(edgeProp));
            }

            for (const propertyIri of propertyIris) {
                const entity = RdfSourceWrap.forIri(propertyIri, source);
                if (propertiesProcessed.has(propertyIri)) {
                    continue;
                }
                propertiesProcessed.add(propertyIri);

                const {resources: associationResources, connectedClasses} = await this.loadRdfsProperty(entity, source);
                associationResources.forEach((r) => (resources[r.iri!] = r));

                processQueue.push(...connectedClasses);
            }

            // Process class hierarchy

            processQueue = [
                ...processQueue,
                ...pimClass.pimExtends.map(this.iriProvider.pimToCim),
            ];
        }

        return resources;
    }

    async search(searchQuery: string): Promise<PimClass[]> {
        const source = await this.getFetchedSource();
        const classes = await source.reverseProperty(RDF.type, this.options.classType);

        const classesObjects = [] as PimClass[];
        for (const rdfObjectClass of classes) {
            classesObjects.push(await this.getClass(rdfObjectClass.value) as PimClass);
        }

        const regExp = new RegExp(searchQuery, "i");

        const filteredClasses = classesObjects.filter((pimClass) => {
            return regExp.test(pimClass.pimHumanLabel?.en ?? "");
        });

        filteredClasses.sort((a, b) => a.pimHumanLabel!.en.length - b.pimHumanLabel!.en.length);

        return filteredClasses;
    }
    async getClass(cimIri: string): Promise<PimClass | null> {
        const source = await this.getFetchedSource();
        const entity = RdfSourceWrap.forIri(cimIri, source);

        if (!(await isRdfsClass(entity))) {
            return null;
        }

        return await loadRdfsClass(entity, this.iriProvider);
    }
    async getSurroundings(cimIri: string): Promise<CoreResourceReader> {
        const source = await this.getFetchedSource();
        const resources = await this.loadPimEntitiesGraphFromEntity(cimIri, source);
        return ReadOnlyMemoryStore.create(resources);
    }
    async getFullHierarchy(cimIri: string): Promise<CoreResourceReader> {
        const source = await this.getFetchedSource();
        const resources = await this.loadPimEntitiesGraphFromEntity(cimIri, source);
        return ReadOnlyMemoryStore.create(resources);
    }
    async getResourceGroup(cimIri: string): Promise<string[]> {
        return [];
    }

    /**
     * So far we suppose that only one domain and one range node is present. If the range node looks like primitive
     * type, we return attribute, otherwise we return association.
     */
    async loadRdfsProperty(
        entity: RdfSourceWrap,
        source: RdfSource,
    ): Promise<{
        resources: CoreResource[],
        connectedClasses: string[],
    }> {
        const resources = [] as CoreResource[];
        const connectedClasses = [] as string[];

        const allDomainProperties = [
            ...this.options.propertyDomain,
            ...this.options.propertyDomainIncludes,
        ];
        const allRangeProperties = [
            ...this.options.propertyRange,
            ...this.options.propertyRangeIncludes,
        ];
        const domainNodes = [] as string[];
        for (const domainProp of allDomainProperties) {
            domainNodes.push(...await entity.nodes(domainProp));
        }
        const rangeNodes = [] as string[];
        for (const rangeProp of allRangeProperties) {
            rangeNodes.push(...await entity.nodes(rangeProp));
        }

        let isAttribute = false;
        if (rangeNodes.length > 0) {
            isAttribute ||= rangeNodes[0].startsWith("http://www.w3.org/2001/XMLSchema#");
            isAttribute ||= rangeNodes[0] === RDFS.Literal;
            isAttribute ||= rangeNodes[0] === RDF.langString;
        }

        if (isAttribute) {
            const attribute = new PimAttribute();
            attribute.iri = this.iriProvider.cimToPim(entity.iri);
            await loadRdfsEntityToResource(entity, this.iriProvider, attribute);
            attribute.pimOwnerClass = this.iriProvider.cimToPim(domainNodes[0]!);
            attribute.pimDatatype = rangeNodes[0] ?? null;

            resources.push(attribute);
        } else {
            const domain = new PimAssociationEnd();
            domain.iri = this.iriProvider.cimToPim(entity.iri + "#domain");
            domain.pimPart = this.iriProvider.cimToPim(domainNodes[0]);

            const range = new PimAssociationEnd();
            range.iri = this.iriProvider.cimToPim(entity.iri + "#range");
            range.pimPart = this.iriProvider.cimToPim(rangeNodes[0]);

            const association = new PimAssociation();
            await loadRdfsEntityToResource(entity, this.iriProvider, association);
            association.pimIsOriented = true;

            association.pimEnd = [domain.iri, range.iri];

            connectedClasses.push(domainNodes[0], rangeNodes[0]);

            resources.push(domain, association, range);
        }

        return {resources, connectedClasses};
    }
}
