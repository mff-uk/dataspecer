import {HttpFetch} from "./fetch-api";

// @ts-ignore
export const httpFetch: HttpFetch = (...p) => fetch(...p);
