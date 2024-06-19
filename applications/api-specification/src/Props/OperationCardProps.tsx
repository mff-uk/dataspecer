import { DataStructure } from '@/Models/DataStructureModel';
import { BaseProps } from './BaseProps';

/* Props passed to the OperationCard component */
export interface OperationCardProps extends BaseProps {
    setValue: any;
    getValues: any;
    selectedDataStructure: string;
    fetchedDataStructures: DataStructure[];
    selectedDataStruct: any,
    defaultValue: string
    removeOperation: (index: number, operationIndex: number) => void;

}
