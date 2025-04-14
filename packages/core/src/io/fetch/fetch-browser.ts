import {HttpFetch} from "./fetch-api.ts";

// @ts-ignore
export const httpFetch: HttpFetch = (...p) => fetch(...p);
