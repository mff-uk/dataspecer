import { DataStructure } from '@/Models/DataStructureNex.tsx';
import { BaseProps } from './BaseProps';

export interface OperationCardProps extends BaseProps 
{

    setValue: any;
    getValues: any;
    baseUrl: string;
    selectedDataStructure: string;
    fetchedDataStructures: DataStructure[];
    selectedDataStruct: any,
    defaultValue: string
    removeOperation: (index: number, operationIndex: number) => void;

}


// interface OperationCardProps {
//     operationIndex: number;
//     removeOperation: (index: number, operationIndex: number) => void;
//     index: number;
//     register: any;
//     setValue: any;
//     getValues: any;
//     baseUrl: string;
//     selectedDataStructure: string;
//     fetchedDataStructures: DataStructure[];
//     selectedDataStruct: any,
//     defaultValue: string
// }