import express from "express";
import {generateBikeshed} from "../transformers/bikeshed";
import {asyncHandler} from "../utils/async-handler";

export const generateBikeshedRoute = asyncHandler(async (request: express.Request, response: express.Response) => {
    const input = request.body;
    const result = await generateBikeshed(input);
    await response.send(result);
});
