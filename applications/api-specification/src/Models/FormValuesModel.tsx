import { Operation } from "./OperationModel";

/* This model represents form values */
export type FormValues = {
    apiTitle: string;
    apiDescription: string;
    apiVersion: string;
    baseUrl: string;
    dataStructures: {
        id?: string;
        name: string;
        operations: Operation[];
    }[];
};