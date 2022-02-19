import express from "express";
import {prisma} from "../main";
import {DataStructure} from ".prisma/client";

function artifactsFromDataStructure(dataStructure: DataStructure) {
    const result = [];
    if (dataStructure.artifact_xml) {
        result.push('xml');
    }
    if (dataStructure.artifact_json) {
        result.push('json');
    }
    return result;
}

function getStore(storeId: string, tags: string[], artifacts?: string[]) {
    return {
        store: {
            type: "sync-memory-store",
            url: process.env.HOST + "/store/" + storeId,
        },
        metadata: {
            tags,
            ...(artifacts ? {artifacts} : {}),
        },
    };
}

async function findRecursivelyReusedDataSpecifications(s: any[]): Promise<any[]> {
    const reusesDataSpecifications = [...s];
    let indexToCheck = 0;
    while (indexToCheck < reusesDataSpecifications.length) {
        const thisSpecification = reusesDataSpecifications[indexToCheck++];

        const result = await prisma.dataSpecification.findFirst({
            where: {
                id: thisSpecification.id
            },
            include: {
                reusesDataSpecification: {
                    include: {
                        hasDataStructures: true
                    }
                }
            }
        });

        if (result) {
            for (const specification of result.reusesDataSpecification) {
                if (reusesDataSpecifications.some(spec => spec.id === specification.id)) {
                    continue
                }

                reusesDataSpecifications.push(specification);
            }
        }
    }

    return reusesDataSpecifications;
}

export const configurationBySpecification = async (request: express.Request, response: express.Response) => {
    const dataSpecification = await prisma.dataSpecification.findFirst({
        where: {
            id: request.params.specificationId
        },
        include: {
            hasDataStructures: true,
            reusesDataSpecification: {
                include: {
                    hasDataStructures: true,
                    reusesDataSpecification: true,
                }
            }
        }
    });

    if (!dataSpecification) {
        response.sendStatus(404);
        return;
    }

    const reusesDataSpecifications = await findRecursivelyReusedDataSpecifications(dataSpecification.reusesDataSpecification);

    const data = {
        stores: [
            getStore(dataSpecification.pimStore, ["root", "pim"]),
            ...dataSpecification.hasDataStructures.map(dataStructure => getStore(dataStructure.store, ["root", "data-psm"], artifactsFromDataStructure(dataStructure))),

            ...dataSpecification.reusesDataSpecification.map(specification =>
                getStore(specification.pimStore, ["pim", "reused", "read-only"])
            ),
            ...dataSpecification.reusesDataSpecification.map(specification =>
                specification.hasDataStructures.map(pimStore =>
                    getStore(pimStore.store, ["data-psm", "reused", "read-only"], artifactsFromDataStructure(pimStore))
                )
            ).flat(),


            ...reusesDataSpecifications
                .filter(spec => !dataSpecification.reusesDataSpecification.some(reusedSpec => reusedSpec.id === spec.id))
                .map(specification =>
                    getStore(specification.pimStore, ["pim", "reused-recursively", "read-only"])
                ),
            ...reusesDataSpecifications
                .filter(spec => !dataSpecification.reusesDataSpecification.some(reusedSpec => reusedSpec.id === spec.id))
                .map(specification =>
                    specification.hasDataStructures.map((pimStore: any) =>
                        getStore(pimStore.store, ["data-psm", "reused-recursively", "read-only"], artifactsFromDataStructure(pimStore))
                    )
                ).flat(),
        ]
    }

    response.send(JSON.stringify(data));
};

export const configurationByDataPsm = async (request: express.Request, response: express.Response) => {
    const dataStructure = await prisma.dataStructure.findFirst({
        where: {
            id: request.params.dataPsmId,
        },
        include: {
            belongsToDataSpecification: {
                include: {
                    reusesDataSpecification: {
                        include: {
                            hasDataStructures: true
                        }
                    }
                }
            }
        }
    });

    if (!dataStructure) {
        response.sendStatus(404);
        return;
    }

    const reusesDataSpecifications = await findRecursivelyReusedDataSpecifications(dataStructure.belongsToDataSpecification.reusesDataSpecification);

    const data = {
        stores: [
            getStore(dataStructure.belongsToDataSpecification.pimStore, ["root", "pim"]),
            getStore(dataStructure.store, ["root", "data-psm"], artifactsFromDataStructure(dataStructure)),


            ...dataStructure.belongsToDataSpecification.reusesDataSpecification.map(specification =>
                getStore(specification.pimStore, ["pim", "reused", "read-only"])
            ),
            ...dataStructure.belongsToDataSpecification.reusesDataSpecification.map(specification =>
                specification.hasDataStructures.map(pimStore =>
                    getStore(pimStore.store, ["data-psm", "reused", "read-only"], artifactsFromDataStructure(pimStore))
                )
            ).flat(),


            ...reusesDataSpecifications
                .filter(spec => !dataStructure.belongsToDataSpecification.reusesDataSpecification.some(reusedSpec => reusedSpec.id === spec.id))
                .map(specification =>
                getStore(specification.pimStore, ["pim", "reused-recursively", "read-only"])
            ),
            ...reusesDataSpecifications
                .filter(spec => !dataStructure.belongsToDataSpecification.reusesDataSpecification.some(reusedSpec => reusedSpec.id === spec.id))
                .map(specification =>
                specification.hasDataStructures.map((pimStore: any) =>
                    getStore(pimStore.store, ["data-psm", "reused-recursively", "read-only"], artifactsFromDataStructure(pimStore))
                )
            ).flat(),
        ]
    }
    response.send(JSON.stringify(data));
}
