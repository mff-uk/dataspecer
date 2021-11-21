import express from "express";
import {prisma} from "../main";

function getStore(storeId: string, tags: string[]) {
    return {
        store: {
            type: "sync-memory-store",
            url: process.env.HOST + "/store/" + storeId,
        },
        metadata: {
            tags
        }
    }
}

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

    const reusesDataSpecifications = [...dataStructure.belongsToDataSpecification.reusesDataSpecification] ?? [];
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
                if (specification.id === dataStructure.belongsToDataSpecification.id) {
                    continue
                }

                if (reusesDataSpecifications.some(spec => spec.id === specification.id)) {
                    continue
                }

                reusesDataSpecifications.push(specification);
            }
        }
    }

    const data = {
        stores: [
            getStore(dataStructure.store, ["root", "data-psm"]),
            getStore(dataStructure.belongsToDataSpecification.pimStore, ["root", "pim"]),


            ...dataStructure.belongsToDataSpecification.reusesDataSpecification.map(specification =>
                getStore(specification.pimStore, ["pim", "reused", "read-only"])
            ),
            ...dataStructure.belongsToDataSpecification.reusesDataSpecification.map(specification =>
                specification.hasDataStructures.map(pimStore =>
                    getStore(pimStore.store, ["data-psm", "reused", "read-only"])
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
                specification.hasDataStructures.map(pimStore =>
                    getStore(pimStore.store, ["data-psm", "reused-recursively", "read-only"])
                )
            ).flat(),
        ]
    }
    response.send(JSON.stringify(data));
}
