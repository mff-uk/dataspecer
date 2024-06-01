import { Operation } from "./OperationModel";

/* This model represent form values */
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