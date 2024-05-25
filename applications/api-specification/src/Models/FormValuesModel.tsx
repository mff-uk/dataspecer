import { Operation } from "./OperationModel";

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