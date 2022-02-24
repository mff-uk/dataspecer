import express from "express";
import {storeModel} from "../main";
import {asyncHandler} from "../utils/async-handler";

export const readStore = asyncHandler(async (request: express.Request, response: express.Response) => {
    const store = await storeModel.get(request.params.storeId);

    if (store !== null) {
        await response.send(store);
    } else {
        await response.sendStatus(400);
    }
});

export const writeStore = asyncHandler(async (request: express.Request, response: express.Response) => {
    await storeModel.set(request.params.storeId, JSON.stringify(request.body));
    response.sendStatus(204);
});
