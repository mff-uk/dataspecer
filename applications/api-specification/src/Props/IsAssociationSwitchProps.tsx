import { DataStructure } from '../Models/DataStructureModel';
import {BaseProps} from './BaseProps';

export interface IsAssociationSwitchProps extends BaseProps 
{
    setValue: (path: string, value: any) => void;
    getValues: any;
    dataStructureName: string;
    dataStructures: DataStructure[];
    setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
    setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
    setAssociationModeOn: React.Dispatch<React.SetStateAction<boolean>>;
    defaultValue: string;
}

// export interface IsAssociationSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: (path: string, value: any) => void;
//     getValues: any;
//     dataStructureName: string;
//     dataStructures: DataStructure[];
//     setSelectedResponseObject: React.Dispatch<React.SetStateAction<any>>;
//     setResponseObjectFields: React.Dispatch<React.SetStateAction<DataStructure[]>>;
//     setAssociationModeOn: React.Dispatch<React.SetStateAction<boolean>>;
//     defaultValue: string;
// }