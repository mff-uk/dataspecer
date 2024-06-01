import { BaseProps } from './BaseProps';
import { DataStructure, Field as DataField } from '@/Models/DataStructureModel';

/* Props passed to the RequestBody component*/
export interface RequestBodyComponentProps extends BaseProps {
    dataStructure: string;
    setValue: any;
    allDataStructures?: DataStructure[];
    responseDataStructures?: DataStructure[];
    associationModeOn: boolean,
    getValues: any
}