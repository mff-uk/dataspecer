import { DataStructure } from "./DataStructureModel";

export type Operation = {
    name: string;
    isCollection: boolean;
    oAssociatonMode: boolean;
    oType: string;
    oName: string;
    oEndpoint: string;
    oComment: string;
    oResponse: string;
    oRequestBody: {
        [key: string]: string;
    };
    oResponseObject?: DataStructure
};