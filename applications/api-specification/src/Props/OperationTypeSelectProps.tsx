import { DataStructure } from '@/Models/DataStructureModel';
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