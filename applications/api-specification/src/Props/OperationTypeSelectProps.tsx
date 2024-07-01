import { DataStructure } from '@/Models/DataStructureModel';
import { BaseProps } from './BaseProps';

/* Props passed to OperationTypeSelect component*/
export interface OperationTypeSelectProps extends BaseProps {
    setValue: any;
    dataStructure: string;
    allDataStructures: DataStructure[];
    responseObjectFields?: DataStructure[];
    selectedResponseObject?: string;
    isCollection: boolean;
    associationModeOn: boolean;
    getValues: any
}