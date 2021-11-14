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
    const result = await prisma.dataPsm.findFirst({
        where: {
            id: request.params.dataPsmId,
        },
        include: {
            specification: {
                include: {
                    linkedSpecification: {
                        include: {
                            DataPsm: true
                        }
                    }
                }
            }
        }
    });

    if (result) {
        const data = {
            stores: [
                getStore(result.store, ["root", "data-psm"]),
                getStore(result.specification.pimStore, ["root", "pim"]),
                ...result.specification.linkedSpecification.map(specification =>
                    getStore(specification.pimStore, ["pim", "linked"])
                ),
                ...result.specification.linkedSpecification.map(specification =>
                    specification.DataPsm.map(pimStore =>
                        getStore(pimStore.store, ["data-psm", "linked"])
                    )
                ).flat()
            ]
        }
        response.send(JSON.stringify(data));
    } else {
        response.sendStatus(404);
    }
}
