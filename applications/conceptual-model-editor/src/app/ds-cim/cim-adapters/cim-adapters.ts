import { CimAdapter, IriProvider } from "@dataspecer/core/cim";
import { CoreResource, CoreResourceReader } from "@dataspecer/core/core";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { PimAssociation, PimAssociationEnd, PimAttribute, PimClass } from "@dataspecer/core/pim/model";
import { RdfsFileAdapter } from "@dataspecer/rdfs-adapter";
import { SgovAdapter } from "@dataspecer/sgov-adapter";

export type NewCimAdapter = CimAdapter & dsCmeAdapter;

class MyIriProvider implements IriProvider {
    cimToPim(cimId: string) {
        return cimId; // keep shit the same
    }
    pimToCim(pimId: string) {
        return pimId; // keep shit the same
    }
}
export interface dsCmeAdapter {
    getId(): string;
    getLabel(): string;
    getAttributesOf(iri: string): Promise<PimAttribute[]>;
    getAssociationsOf(iri: string): Promise<PimAssociation[]>;
}

export class InMemoryCimAdapter extends RdfsFileAdapter implements dsCmeAdapter {
    private id;
    constructor(urls: string[], httpFetch: HttpFetch) {
        super(urls, httpFetch);
        this.id = "inMemAdapter" + Date.now();
    }

    getId() {
        return this.id;
    }

    getLabel() {
        return "IMA-";
    }

    // FIXME: remove after PoC
    async getAssociationsOf(iri: string) {
        const pimAssociationFilterFunction = (resource: CoreResource, resourceOwnerClass: PimClass | undefined) => {
            return (
                PimAssociation.is(resource) &&
                // resource. !== null &&
                resourceOwnerClass?.pimInterpretation === iri
            );
        };

        const pimOwnerClassOf = async (resource: CoreResource, surroundings: CoreResourceReader) => {
            if (PimAssociation.is(resource) && resource.pimEnd[0]) {
                return (await surroundings?.readResource(
                    ((await surroundings?.readResource(resource.pimEnd[0])) as PimAssociationEnd)?.pimPart as string
                )) as PimClass;
            }
            return undefined;
        };

        const associations = await this.getSurroundings(iri)
            .then(async (surroundings) => {
                return { rs: await surroundings.listResources(), surroundings };
            })
            .then(({ rs: resourceIris, surroundings }) =>
                resourceIris.map(async (resource) => {
                    const cr = (await surroundings.readResource(resource)) as CoreResource;
                    const resourceOwnerClass = await pimOwnerClassOf(cr, surroundings);
                    return {
                        coreResource: cr,
                        resourceOwnerClass,
                    };
                })
            )
            .then(async (resourcesAndPimOwners) => {
                const filteredAssociationsAsResources = (await Promise.all(resourcesAndPimOwners)).filter(
                    (resourceAndOwner) => {
                        return pimAssociationFilterFunction(
                            resourceAndOwner.coreResource,
                            resourceAndOwner.resourceOwnerClass
                        );
                    }
                );
                const filteredAssociations = filteredAssociationsAsResources
                    .map((cr) => cr.coreResource)
                    .filter((associationOrNull): associationOrNull is PimAssociation => associationOrNull !== null);
                console.log(
                    `filtered associations as resources of ${iri}`,
                    filteredAssociationsAsResources,
                    filteredAssociations
                );

                return filteredAssociations;
            });

        return associations;
    }

    async getAttributesOf(iri: string) {
        // inspired by AddInterpretedSurroundingsDialog
        const pimAttributeFilterFunction = (resource: CoreResource, resourceOwnerClass: PimClass | undefined) => {
            return (
                PimAttribute.is(resource) &&
                resource.pimOwnerClass !== null &&
                resourceOwnerClass?.pimInterpretation === iri
            );
        };

        const pimOwnerClassOf = async (resource: CoreResource, surroundings: CoreResourceReader) => {
            if (PimAttribute.is(resource) && resource.pimOwnerClass) {
                return (await surroundings?.readResource(resource.pimOwnerClass)) as PimClass;
            }
            return undefined;
        };

        const attributes = await this.getSurroundings(iri)
            .then(async (surroundings) => {
                return { rs: await surroundings.listResources(), surroundings };
            })
            .then(({ rs: resourceIris, surroundings }) =>
                resourceIris.map(async (resource) => {
                    const cr = (await surroundings.readResource(resource)) as CoreResource;
                    const resourceOwnerClass = await pimOwnerClassOf(cr, surroundings);
                    return {
                        coreResource: cr,
                        resourceOwnerClass,
                    };
                })
            )
            .then(async (resourcesAndPimOwners) => {
                const filteredAttributesAsResources = (await Promise.all(resourcesAndPimOwners)).filter(
                    (resourceAndOwner) => {
                        return pimAttributeFilterFunction(
                            resourceAndOwner.coreResource,
                            resourceAndOwner.resourceOwnerClass
                        );
                    }
                );
                console.log(`filtered attributes as resources of ${iri}`, filteredAttributesAsResources);
                const filteredAttributes = filteredAttributesAsResources
                    .map((cr) => cr.coreResource)
                    .filter((attributeOrNull): attributeOrNull is PimAttribute => attributeOrNull !== null);
                return filteredAttributes;
            });

        return attributes;
    }

    static is(elem: any): elem is InMemoryCimAdapter {
        return elem?.id?.startsWith("inMemAdapter") ?? false;
    }
}

export class ExternalCimAdapter extends SgovAdapter implements dsCmeAdapter {
    private id;
    constructor(httpFetch: HttpFetch) {
        super("https://slovník.gov.cz/sparql", httpFetch);
        this.id = "externalAdapter" + Date.now();
    }

    getId() {
        return this.id;
    }

    getLabel() {
        return "EA-";
    }

    // FIXME: remove after PoC
    async getAttributesOf(iri: string): Promise<PimAttribute[]> {
        return [];
    }

    // FIXME: remove after PoC
    async getAssociationsOf(iri: string): Promise<PimAssociation[]> {
        return [];
    }

    static is(elem: any): elem is InMemoryCimAdapter {
        return elem?.id?.startsWith("externalAdapter") ?? false;
    }
}

export class LocalCimAdapter implements dsCmeAdapter {
    getId(): string {
        return "localChanges";
    }
    getLabel(): string {
        return "localChanges";
    }

    // FIXME: remove after PoC
    async getAttributesOf(iri: string): Promise<PimAttribute[]> {
        return [];
    }

    // FIXME: remove after PoC
    async getAssociationsOf(iri: string): Promise<PimAssociation[]> {
        throw new Error("Method not implemented.");
    }
}

export const getLocalCimAdapter = () => {
    const localAdapter = new LocalCimAdapter();
    return localAdapter;
};

const getAnExternalAdapter = () => {
    const externalAdapter = new ExternalCimAdapter(httpFetch);
    externalAdapter.setIriProvider(new MyIriProvider());
    return externalAdapter;
};

const getAnInMemoryAdapter = () => {
    const adapter = new InMemoryCimAdapter(
        [
            "https://mff-uk.github.io/demo-vocabularies/original/adms.ttl",
            "https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl",
        ],
        httpFetch
    );
    adapter.setIriProvider(new MyIriProvider());
    return adapter;
};

export const getSampleAdapters = () => {
    return [getAnExternalAdapter(), getAnInMemoryAdapter()];
};
