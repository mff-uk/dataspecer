import express from "express";
import {generateBikeshed} from "../transformers/bikeshed";

export async function generateBikeshedRoute(request: express.Request, response: express.Response) {
    const input = request.body;
    try {
        const result = await generateBikeshed(input);
        await response.send(result);
    } catch (e) {
        await response.status(500).send("Unable to generate bikeshed.");
    }
}
