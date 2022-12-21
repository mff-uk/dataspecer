import {CimAdapter, IriProvider} from "@dataspecer/core/cim";
import {CoreResourceReader} from "@dataspecer/core/core/core-reader";
import {PimClass} from "@dataspecer/core/pim/model/pim-class";
import {RdfHttpSource} from "@dataspecer/core/io/rdf/http/http-rdf-source";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";
import {RdfNode, RdfObject, RdfSource, RdfSourceWrap} from "@dataspecer/core/core/adapter/rdf";
import {OFN, OWL, RDF, RDFS, SCHEMAORG, XSD} from "./rdfs-vocabulary";
import {CoreResource, ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {loadRdfsEntityToResource} from "./entity-adapters/rdfs-entity-adapter";
import {PimAssociation, PimAssociationEnd, PimAttribute} from "@dataspecer/core/pim/model";

const UNION_DOMAIN_PREFIX = "https://dataspecer.com/cim/abstract-class-union-domain/";
const UNION_RANGE_PREFIX = "https://dataspecer.com/cim/abstract-class-union-range/";

async function rdfSourceProperty(source: RdfSource, iri: string, properties: string[]): Promise<RdfObject[]> {
    const result = [] as RdfObject[];
    for (const property of properties) {
        const objects = await source.property(iri, property);
        objects.forEach(object => result.find(o => o.value === object.value) || result.push(object));
    }
    return result;
}

async function rdfSourceReverseProperty(source: RdfSource, iris: string[], properties: string[]): Promise<RdfNode[]> {
    const result = [] as RdfNode[];
    for (const iri of iris) {
        for (const property of properties) {
            const objects = await source.reverseProperty(property, iri);
            objects.forEach(object => result.find(o => o.value === object.value) || result.push(object));
        }
    }
    return result;
}

export async function isRdfsClass(entity: RdfSourceWrap): Promise<boolean> {
    return (await entity.types()).includes("http://www.w3.org/2000/01/rdf-schema#Class");
}

function unique<T>(values: T[]): T[] {
    return [...new Set(values)];
}

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
        property: [RDF.property, OWL.DatatypeProperty, OWL.ObjectProperty],
    }

    constructor(url: string[], httpFetch: HttpFetch) {
        this.urls = url;
        this.httpFetch = httpFetch;
    }

    setIriProvider(iriProvider: IriProvider): void {
        this.iriProvider = iriProvider;
    }

    /**
     * Maps IRI to a datatype used in Dataspecer. If the IRI does not represent a datatype, undefined is returned.
     * If the datatype is unknown, null is returned.
     */
    protected async mapDatatype(iri: string): Promise<string | null | undefined> {
        const mapping = {
            [RDFS.Literal]: null,
            [RDF.langString]: RDF.langString,

            [SCHEMAORG.Boolean]: OFN.boolean,
            [SCHEMAORG.Date]: OFN.date,
            [SCHEMAORG.DateTime]: OFN.dateTime,
            [SCHEMAORG.Number]: OFN.decimal,
            [SCHEMAORG.Text]: OFN.string,
            [SCHEMAORG.Time]: OFN.time,

            [XSD.boolean]: OFN.boolean,
            [XSD.date]: OFN.date,
            [XSD.time]: OFN.time,
            [XSD.dateTimeStamp]: OFN.dateTime,
            [XSD.integer]: OFN.integer,
            [XSD.decimal]: OFN.decimal,
            [XSD.anyURI]: OFN.url,
            [XSD.string]: OFN.string,
        }

        if (Object.hasOwn(mapping, iri)) {
            return mapping[iri];
        }

        if (iri.startsWith("http://www.w3.org/2001/XMLSchema#")) return iri;

        return undefined;
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

    /**
     * Returns descendants even for anonymous classes
     */
    protected async getDirectClassDescendants(cimIri: string, source: RdfSource) {
        if (cimIri === OWL.Thing) {
            const classesIris = await this.getAllClasses(source);
            return classesIris.map(iri => RdfNode.namedNode(iri));
        } else if (cimIri.startsWith(UNION_DOMAIN_PREFIX) || cimIri.startsWith(UNION_RANGE_PREFIX)) {
            const isDomain = cimIri.startsWith(UNION_DOMAIN_PREFIX);
            const iri = isDomain ? cimIri.substring(UNION_DOMAIN_PREFIX.length) : cimIri.substring(UNION_RANGE_PREFIX.length);

            return (await rdfSourceProperty(
                source,
                iri,
                isDomain ?
                    [...this.options.propertyDomain, ...this.options.propertyDomainIncludes] :
                    [...this.options.propertyRange, ...this.options.propertyRangeIncludes]
            ));
        } else {
            return await source.reverseProperty(RDFS.subClassOf, cimIri);
        }
    }

    /**
     * Loads class or anonymous class
     */
    protected async loadRdfsClass(cimIri: string, source: RdfSource): Promise<PimClass> {
        const resource = new PimClass();
        resource.iri = this.iriProvider.cimToPim(cimIri);
        resource.pimInterpretation = cimIri;

        if (cimIri === OWL.Thing) {
            resource.pimHumanLabel = {en: `owl:Thing`};
        } else if (cimIri.startsWith(UNION_DOMAIN_PREFIX) || cimIri.startsWith(UNION_RANGE_PREFIX)) { // Anonymous class
            const isDomain = cimIri.startsWith(UNION_DOMAIN_PREFIX);
            const propertyIri = isDomain ? cimIri.substring(UNION_DOMAIN_PREFIX.length) : cimIri.substring(UNION_RANGE_PREFIX.length);

            const property = new PimAttribute();
            await loadRdfsEntityToResource(RdfSourceWrap.forIri(propertyIri as string, source), this.iriProvider, property);

            resource.pimHumanLabel = Object.fromEntries(Object.entries(property.pimHumanLabel ?? {})
                .map(([lang, text]) => [lang, `[A] ${isDomain ? "Domain" : "Range"} of ${text}`]));
            resource.pimHumanDescription = property.pimHumanDescription;
        } else { // Existing class in CIM
            const entity = RdfSourceWrap.forIri(cimIri, source);
            await loadRdfsEntityToResource(entity, this.iriProvider, resource);
            resource.pimExtends = unique([
                ...resource.pimExtends,
                ...(await entity.nodes(RDFS.subClassOf)).map(this.iriProvider.cimToPim),
            ]);

            // Add anonymous classes for domains
            const propertiesHavingAsDomain = await rdfSourceReverseProperty(source, [cimIri], [...this.options.propertyDomain, ...this.options.propertyDomainIncludes]);
            const propertyIrisWithAnonymousDomainClass = [] as string[];
            for (const prop of propertiesHavingAsDomain) {
                const domain = await rdfSourceProperty(source, prop.value, [...this.options.propertyDomain, ...this.options.propertyDomainIncludes]);
                if (domain.length > 1) {
                    propertyIrisWithAnonymousDomainClass.push(prop.value);
                }
            }
            resource.pimExtends.push(...propertyIrisWithAnonymousDomainClass.map(iri => this.iriProvider.cimToPim(UNION_DOMAIN_PREFIX + iri)));

            // Add anonymous classes for ranges
            const propertiesHavingAsRange = await rdfSourceReverseProperty(source, [cimIri], [...this.options.propertyRange, ...this.options.propertyRangeIncludes]);
            const propertyIrisWithAnonymousRangeClass = [] as string[];
            for (const prop of propertiesHavingAsRange) {
                const range = await rdfSourceProperty(source, prop.value, [...this.options.propertyRange, ...this.options.propertyRangeIncludes]);
                if (range.length > 1) {
                    propertyIrisWithAnonymousRangeClass.push(prop.value);
                }
            }
            resource.pimExtends.push(...propertyIrisWithAnonymousRangeClass.map(iri => this.iriProvider.cimToPim(UNION_RANGE_PREFIX + iri)));
        }

        resource.pimExtends.push(this.iriProvider.cimToPim(OWL.Thing));

        return resource;
    }

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
            const res = await this.getDirectClassDescendants(descendant, source);
            for (const r of res) {
                if (!descendants.includes(r.value)) {
                    descendants.push(r.value);
                }
            }
            processedDescendant++;
        }

        // List of CIM iris to process
        let processQueue: string[] = [rootClassCimIri, ...descendants];
        let lastIri: string = "";
        let classOnlyProcessQueue: string[] = [];
        while (processQueue.length) {
            const processedCimIri = processQueue.pop()!;
            if (classesProcessed.has(processedCimIri)) {
                continue;
            }
            classesProcessed.add(processedCimIri);

            lastIri = processedCimIri;

            // Class itself

            const pimClass = await this.loadRdfsClass(processedCimIri, source);
            resources[pimClass.iri!] = pimClass;

            // Properties

            const propertyIris = (await rdfSourceReverseProperty(source, [processedCimIri], [
                ...this.options.propertyDomain,
                ...this.options.propertyDomainIncludes,
                ...this.options.propertyRange,
                ...this.options.propertyRangeIncludes
            ])).map(r => r.value);

            // Properties that belong to the owl:Thing may not be connected to it directly
            if (processedCimIri === OWL.Thing) {
                // Add all properties that have no domain or range
                const properties = await rdfSourceReverseProperty(source, this.options.property, [RDF.type]);

                for (const prop of properties) {
                    const domains = await rdfSourceReverseProperty(source, [prop.value], [...this.options.propertyDomain, ...this.options.propertyDomainIncludes]);
                    const range = await rdfSourceReverseProperty(source, [prop.value], [...this.options.propertyRange, ...this.options.propertyRangeIncludes]);
                    const type = await source.property(prop.value, RDF.type);

                    if ((domains.length === 0 || (range.length === 0 && !type.some(v => v.value === OWL.DatatypeProperty))) && !propertyIris.includes(prop.value)) {
                        propertyIris.push(prop.value);
                    }
                }
            }

            for (const propertyIri of propertyIris) {
                const entity = RdfSourceWrap.forIri(propertyIri, source);
                if (propertiesProcessed.has(propertyIri)) {
                    continue;
                }
                propertiesProcessed.add(propertyIri);

                const {resources: associationResources, connectedClasses} = await this.loadRdfsProperty(entity);
                associationResources.forEach((r) => (resources[r.iri!] = r));

                classOnlyProcessQueue.push(...connectedClasses);
            }

            // Process class hierarchy

            processQueue.push(...pimClass.pimExtends.map(this.iriProvider.pimToCim));
        }

        while (classOnlyProcessQueue.length) {
            const processedCimIri = classOnlyProcessQueue.pop()!;
            if (classesProcessed.has(processedCimIri)) {
                continue;
            }
            classesProcessed.add(processedCimIri);

            // Class itself

            const pimClass = await this.loadRdfsClass(processedCimIri, source);
            resources[pimClass.iri!] = pimClass;
        }

        return resources;
    }

    protected async getAllClasses(source: RdfSource) {
        const classesIris = (await source.reverseProperty(RDF.type, this.options.classType)).map(r => r.value);

        // Include also all subclasses that are not directly of desired type

        const classesToProcess = [...classesIris];
        let c: string;
        while (c = classesToProcess.pop()!) {
            const subClasses = await source.reverseProperty(RDFS.subClassOf, c);
            subClasses.forEach(s => {
                if (!classesIris.includes(s.value)) {
                    classesIris.push(s.value);
                    classesToProcess.push(s.value);
                }
            });
        }

        return classesIris;
    }

    async search(searchQuery: string): Promise<PimClass[]> {
        const source = await this.getFetchedSource();
        const classesIris = await this.getAllClasses(source);

        const classesObjects = [] as PimClass[];
        for (const c of classesIris) {
            classesObjects.push(await this.getClass(c) as PimClass);
        }

        const regExp = new RegExp(searchQuery, "i");

        const filteredClasses = classesObjects.filter(c => c).filter((pimClass) => {
            return regExp.test(pimClass.pimHumanLabel?.en ?? "") || regExp.test(pimClass.pimInterpretation!);
        });

        filteredClasses.sort((a, b) => (a.pimHumanLabel?.en?.length ?? 1000) - (b.pimHumanLabel?.en?.length ?? 1000));

        return filteredClasses;
    }
    async getClass(cimIri: string): Promise<PimClass | null> {
        const source = await this.getFetchedSource();
        return await this.loadRdfsClass(cimIri, source);
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


        // CIM IRI of the domain class
        let domainClassIri: string;
        if (domainNodes.length === 0) {
            domainClassIri = OWL.Thing;
        } else if (domainNodes.length === 1) {
            domainClassIri = domainNodes[0];
        } else {
            domainClassIri = UNION_DOMAIN_PREFIX + entity.iri;
        }

        // CIM IRI of the range class or IRI of the datatype
        let rangeClassIri: string | null;
        let isAttribute = false;

        const type = await entity.property(RDF.type);
        isAttribute ||= type.some(v => v.value === OWL.DatatypeProperty);

        if (rangeNodes.length === 0) {
            rangeClassIri = OWL.Thing;
        } else if (rangeNodes.length === 1) {
            const mappedDatatype = await this.mapDatatype(rangeNodes[0]);
            if (mappedDatatype !== undefined) {
                rangeClassIri = mappedDatatype;
                isAttribute = true;
            } else {
                rangeClassIri = rangeNodes[0];
            }
        } else {
            // check if all range nodes are attributes
            isAttribute = true;
            rangeClassIri = null;
            for (const rangeNode of rangeNodes) {
                const datatype = await this.mapDatatype(rangeNode);
                if (datatype === undefined) {
                    isAttribute = false;
                    rangeClassIri = UNION_RANGE_PREFIX + entity.iri;
                    break;
                }
                rangeClassIri = datatype; // Set last value because we can set only one of them
            }
        }

        if (isAttribute) {
            const attribute = new PimAttribute();
            attribute.iri = this.iriProvider.cimToPim(entity.iri);
            await loadRdfsEntityToResource(entity, this.iriProvider, attribute);
            attribute.pimOwnerClass = this.iriProvider.cimToPim(domainClassIri);
            attribute.pimDatatype = rangeClassIri;

            connectedClasses.push(domainClassIri);
            resources.push(attribute);
        } else {
            rangeClassIri = rangeClassIri!; // Only attribute may have null

            const domain = new PimAssociationEnd();
            domain.iri = this.iriProvider.cimToPim(entity.iri + "#domain");
            domain.pimPart = this.iriProvider.cimToPim(domainClassIri);

            const range = new PimAssociationEnd();
            range.iri = this.iriProvider.cimToPim(entity.iri + "#range");
            range.pimPart = this.iriProvider.cimToPim(rangeClassIri);

            const association = new PimAssociation();
            await loadRdfsEntityToResource(entity, this.iriProvider, association);
            association.pimIsOriented = true;

            association.pimEnd = [domain.iri, range.iri];

            connectedClasses.push(domainClassIri, rangeClassIri);
            resources.push(domain, association, range);
        }

        return {resources, connectedClasses};
    }
}
