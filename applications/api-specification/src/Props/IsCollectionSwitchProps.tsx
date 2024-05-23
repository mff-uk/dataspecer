import { DataStructure } from '@/Models/DataStructureNex';
import { BaseProps } from './BaseProps';

export interface IsCollectionSwitchProps extends BaseProps 
{
    setValue: (path: string, value: any) => void;
    getValues: any;
    dataStructureName: string;
    dataStructures: DataStructure[];
    setIsCollection: React.Dispatch<React.SetStateAction<boolean>>;
}


// interface IsCollectionSwitchProps {
//     index: number;
//     operationIndex: number;
//     register: any;
//     setValue: (path: string, value: any) => void;
//     getValues: any;
//     dataStructureName: string;
//     dataStructures: DataStructure[];
//     setIsCollection: React.Dispatch<React.SetStateAction<boolean>>;
// }