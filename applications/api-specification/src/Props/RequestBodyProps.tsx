

// interface RequestBodyProps {
//     index: number;
//     operationIndex: number;
//     dataStructure: string;
//     register: any;
//     setValue: any;
//     allDataStructures?: DataStructure[];
//     responseDataStructures?: DataStructure[];
//     associationModeOn: boolean,
//     getValues: any
// }


import {BaseProps} from './BaseProps';
import { DataStructure, Field as DataField } from '@/Models/DataStructureModel';

export interface RequestBodyProps extends BaseProps 
{
    dataStructure: string;
    setValue: any;
    allDataStructures?: DataStructure[];
    responseDataStructures?: DataStructure[];
    associationModeOn: boolean,
    getValues: any
}