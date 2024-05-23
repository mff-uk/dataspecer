// interface OperationTypeSelectProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: any;
//     dataStructure: string;
//     allDataStructures: DataStructure[];
//     responseObjectFields?: DataStructure[];
//     selectedResponseObject?: string;
//     isCollection: boolean;
//     associationModeOn: boolean;
//     getValues: any

// }

import {BaseProps} from './BaseProps';

export interface OperationTypeSelectProps extends BaseProps 
{
    setValue: any;
    dataStructure: string;
    allDataStructures: DataStructure[];
    responseObjectFields?: DataStructure[];
    selectedResponseObject?: string;
    isCollection: boolean;
    associationModeOn: boolean;
    getValues: any
}